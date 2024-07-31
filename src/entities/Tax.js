class Tax {
  static get taxRatioByAge() {
    return [
      { from: 18, to: 25, ratio: 1.1 },
      { from: 26, to: 30, ratio: 1.5 },
      { from: 31, to: 100, ratio: 1.3 },
    ];
  }
}

module.exports = Tax;
