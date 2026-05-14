'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { simulateBuyAndHold } = require('../lib/benchmarkStrategy');

const bar = (date, close) => ({
  date,
  open: close,
  high: close,
  low: close,
  close,
  volume: 1000,
});

test('buy and hold benchmark splits capital equally across symbols', () => {
  const result = simulateBuyAndHold({
    priceBySymbol: {
      AAA: [
        bar('2024-01-01', 10),
        bar('2024-01-02', 20),
      ],
      BBB: [
        bar('2024-01-01', 20),
        bar('2024-01-02', 10),
      ],
    },
    initialCapital: 1000,
  });

  assert.equal(result.startDate, '2024-01-01');
  assert.equal(result.endDate, '2024-01-02');
  assert.equal(result.finalEquity, 1250);
  assert.equal(result.equityCurve.length, 2);
  assert.equal(result.averageExposurePct, 100);
});

test('buy and hold benchmark starts on first common date', () => {
  const result = simulateBuyAndHold({
    priceBySymbol: {
      AAA: [
        bar('2024-01-01', 10),
        bar('2024-01-02', 20),
        bar('2024-01-03', 40),
      ],
      BBB: [
        bar('2024-01-02', 10),
        bar('2024-01-03', 20),
      ],
    },
    initialCapital: 1000,
  });

  assert.equal(result.startDate, '2024-01-02');
  assert.equal(result.finalEquity, 2000);
});
