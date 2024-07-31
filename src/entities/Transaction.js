class Transaction {
  constructor({ customer, car, finalPrice, dueDate }) {
    this.customer = customer;
    this.car = car;
    this.finalPrice = finalPrice;
    this.dueDate = dueDate;
  }
}

module.exports = Transaction;
