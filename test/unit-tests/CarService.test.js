const { describe, it, beforeEach, afterEach } = require('mocha');
const { join } = require('path');
const { createSandbox } = require('sinon');

const CarService = require('../../src/services/CarService');
const Transaction = require('../../src/entities/Transaction');
const carsDatabase = join(__dirname, './../../database', 'cars.json');

const mocks = {
  validCarCategory: require('../mocks/valid-car-category.json'),
  validCar: require('../mocks/valid-car.json'),
  validCustomer: require('../mocks/valid-customer.json'),
};

describe('CarService test suite', () => {
  let carService;
  let expect;
  let sandbox;

  before(async () => {
    expect = (await import('chai')).expect;
    carService = new CarService({ cars: carsDatabase });
  });

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should retrieve a random position from an array', () => {
    const data = [0, 1, 2, 3, 4];
    const result = carService.getRandomPositionFromArray(data);

    expect(result).to.be.gte(0).and.lte(data.length);
  });

  it('should choose the first id from carIds in carCategory', () => {
    const carCategory = mocks.validCarCategory;
    const carIdIndex = 0;

    sandbox
      .stub(carService, carService.getRandomPositionFromArray.name)
      .returns(carIdIndex);

    const result = carService.chooseRandomCar(carCategory);
    const expected = carCategory.carIds[carIdIndex];

    expect(carService.getRandomPositionFromArray.calledOnce).to.be.ok;
    expect(result).to.be.equal(expected);
  });

  it('should return an available car given a car category', async () => {
    const car = mocks.validCar;
    const carCategory = structuredClone(mocks.validCarCategory);

    carCategory.carIds = [car.id];

    sandbox
      .stub(carService.carRepository, carService.carRepository.find.name)
      .resolves(car);

    sandbox.spy(carService, carService.chooseRandomCar.name);

    const result = await carService.getAvailableCar(carCategory);
    const expected = car;

    expect(carService.chooseRandomCar.calledOnce).to.be.ok;
    expect(carService.carRepository.find.calledWithExactly(car.id)).to.be.ok;
    expect(result).to.be.deep.equal(expected);
  });

  it('should calculate final amount in real when given a customer, a car category and a number of days', () => {
    const customer = structuredClone(mocks.validCustomer);
    customer.age = 50;

    const carCategory = structuredClone(mocks.validCarCategory);
    carCategory.price = 37.6;

    const numberOfDays = 5;

    sandbox
      .stub(carService, 'taxRatioByAge')
      .returns([{ from: 31, to: 100, ratio: 1.3 }]);

    const result = carService.calculateFinalPrice({
      customer,
      carCategory,
      numberOfDays,
    });
    const expected = carService.currencyFormat.format(244.4);

    expect(result).to.be.deep.equal(expected);
  });

  it('should return a transaction receipt when finalize a car renting', async () => {
    const customer = structuredClone(mocks.validCustomer);
    customer.age = 50;

    const car = mocks.validCar;

    const carCategory = {
      ...mocks.validCarCategory,
      price: 37.6,
      carIds: [car.id],
    };

    const numberOfDays = 5;

    const dueDate = '10 de novembro de 2020';

    const today = new Date(2020, 10, 5);

    sandbox.useFakeTimers(today.getTime());
    sandbox.stub(carService, carService.getAvailableCar.name).resolves(car);

    const expectedAmount = carService.currencyFormat.format(244.4);

    const expected = new Transaction({
      customer,
      car,
      finalPrice: expectedAmount,
      dueDate,
    });

    const result = await carService.rent({
      customer,
      carCategory,
      numberOfDays,
    });
    expect(result).to.be.deep.equal(expected);
  });
});
