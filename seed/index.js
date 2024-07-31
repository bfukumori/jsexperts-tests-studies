const { faker } = require('@faker-js/faker');
const { join } = require('path');
const { writeFile } = require('fs/promises');

const CarCategory = require('../src/entities/CarCategory');
const Car = require('../src/entities/Car');
const Customer = require('../src/entities/Customer');

const seederBaseFolder = join(__dirname, '../', 'database');
const mocksBaseFolder = join(__dirname, '../', 'test', 'mocks');

const ITEMS_AMOUNT = 2;

const carCategory = new CarCategory({
  id: faker.string.uuid(),
  name: faker.vehicle.type(),
  carIds: [],
  price: Number(faker.finance.amount({ min: 20, max: 100 })),
});

const cars = [];
const customers = [];

for (let i = 0; i <= ITEMS_AMOUNT; i++) {
  const car = new Car({
    id: faker.string.uuid(),
    name: faker.vehicle.model(),
    releaseYear: faker.date.past().getFullYear(),
    available: faker.datatype.boolean(0.5),
    gasAvailable: faker.datatype.boolean(0.5),
  });

  carCategory.carIds.push(car.id);
  cars.push(car);

  const customer = new Customer({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    age: faker.number.int({ min: 18, max: 50 }),
  });

  customers.push(customer);
}

const writeToDatabase = (filename, data) =>
  writeFile(join(seederBaseFolder, filename), JSON.stringify(data, null, 2));

const writeToMocks = (filename, data) =>
  writeFile(join(mocksBaseFolder, filename), JSON.stringify(data, null, 2));

(async () => {
  Promise.all([
    writeToDatabase('carCategory.json', [carCategory]),
    writeToDatabase('cars.json', cars),
    writeToDatabase('customers.json', customers),
    writeToMocks('valid-car.json', cars[0]),
    writeToMocks('valid-car-category.json', carCategory),
    writeToMocks('valid-customer.json', customers[0]),
  ]);
})();
