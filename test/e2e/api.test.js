const { describe, it } = require('mocha');
const supertest = require('supertest');
const assert = require('assert');

const mocks = {
  validCarCategory: require('../mocks/valid-car-category.json'),
  validCustomer: require('../mocks/valid-customer.json'),
};

describe('E2E Suite test', () => {
  let app;
  before((done) => {
    app = require('../../src/api');
    app.once('listening', done());
  });
  after((done) => {
    app = require('../../src/api');
    app.close(done());
  });

  describe('/rent:post', () => {
    it('should be able to rent a car', async () => {
      const response = await supertest(app)
        .post('/rent')
        .send({
          customer: mocks.validCustomer,
          carCategory: mocks.validCarCategory,
          numberOfDays: 5,
        })
        .expect(201);

      const expected = 'Car rented with success!';

      assert.strictEqual(response.text, expected);
    });
  });
});
