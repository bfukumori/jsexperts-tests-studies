const Tax = require('../entities/Tax');
const Transaction = require('../entities/Transaction');
const BaseRepository = require('../repositories/base/BaseRepository');

class CarService {
  constructor({ cars }) {
    this.carRepository = new BaseRepository({ file: cars });
    this.taxRatioByAge = Tax.taxRatioByAge;
    this.currencyFormat = Intl.NumberFormat('pt-br', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  getRandomPositionFromArray(list) {
    const listLength = list.length;
    return Math.floor(Math.random() * listLength);
  }

  chooseRandomCar(carCategory) {
    const randomCarIndex = this.getRandomPositionFromArray(carCategory.carIds);
    const carId = carCategory.carIds[randomCarIndex];
    return carId;
  }

  async getAvailableCar(carCategory) {
    const carId = this.chooseRandomCar(carCategory);
    const car = await this.carRepository.find(carId);

    return car;
  }

  calculateFinalPrice({ customer, carCategory, numberOfDays }) {
    const { age } = customer;
    const { price } = carCategory;
    const { ratio } = Tax.taxRatioByAge.find(
      (tax) => age >= tax.from && age <= tax.to
    );

    return this.currencyFormat.format(price * ratio * numberOfDays);
  }

  async rent({ customer, carCategory, numberOfDays }) {
    const car = await this.getAvailableCar(carCategory);
    const finalPrice = this.calculateFinalPrice({
      customer,
      carCategory,
      numberOfDays,
    });
    const today = new Date();
    const dueDate = today.setDate(today.getDate() + numberOfDays);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const dueDateFormated = new Date(dueDate).toLocaleDateString(
      'pt-br',
      options
    );

    const transaction = new Transaction({
      customer,
      car,
      finalPrice,
      dueDate: dueDateFormated,
    });

    return transaction;
  }
}

module.exports = CarService;
