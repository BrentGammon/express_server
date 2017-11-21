const jstat = require("jstat");
const ttest = require("ttest");

function welchTTest(dataset1, dataset2, alt) {
  return ttest(dataset1, dataset2, {
    mu: 0,
    varEqual: true,
    alpha: 0.3,
    alternative: alt
  }).valid();
}

function square(a) {
  return a * a;
}

function mean(dataSet) {
  return (
    dataSet.reduce((a, b) => {
      return a + b;
    }) / dataSet.length
  );
}

function standardDeviation(dataSet) {
  return Math.sqrt(variance(dataSet));
}

function variance(dataSet) {
  const average = mean(dataSet);
  return mean(
    dataSet.map(function(num) {
      return Math.pow(num - average, 2);
    })
  );
}

function lowest(dataSet) {
  return Math.min(...dataSet);
}

function highest(dataSet) {
  return Math.max(...dataSet);
}

module.exports = {
  welchTTest: welchTTest,
  square: square,
  mean: mean,
  standardDeviation: standardDeviation,
  variance: variance,
  lowest: lowest,
  highest: highest
};
