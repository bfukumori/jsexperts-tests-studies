const { createServer } = require('http');
const { once } = require('events');
const { join } = require('path');
const CarService = require('./services/CarService');
const cars = join(__dirname, '../database', 'cars.json');

const routes = {
  '/rent:post': async (req, res) => {
    const { customer, carCategory, numberOfDays } = JSON.parse(
      await once(req, 'data')
    );

    const carService = new CarService({ cars });

    await carService.rent({
      customer,
      carCategory,
      numberOfDays,
    });
    res.writeHead(201);
    res.write('Car rented with success!');
    res.end();
  },
};

function handler(req, res) {
  const { url, method } = req;

  const routeKey = `${url.toLowerCase()}:${method.toLowerCase()}`;
  const chosen = routes[routeKey];

  return chosen(req, res);
}

const app = createServer(handler).listen(3000, () =>
  console.log('App running at http://localhost:3000')
);

module.exports = app;
