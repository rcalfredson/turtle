'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { simulatePortfolioTrading } = require('../lib/portfolioStrategy');

const bar = (date, open, high, low, close) => ({
  date,
  open,
  high,
  low,
  close,
  volume: 1000,
});

test('portfolio simulation shares capital across symbols and respects maxOpenPositions', () => {
  const prices = [
    bar('2024-01-01', 10, 10, 9, 9.5),
    bar('2024-01-02', 10, 10, 9, 9.5),
    bar('2024-01-03', 10, 13, 10, 12.5),
    bar('2024-01-04', 12.5, 13, 12, 12.5),
  ];

  const result = simulatePortfolioTrading({
    priceBySymbol: {
      AAA: prices,
      BBB: prices,
    },
    initialCapital: 10000,
    riskPercent: 1,
    entryPeriod: 2,
    exitPeriod: 1,
    atrPeriod: 2,
    maxUnits: 1,
    maxOpenPositions: 1,
  });

  assert.equal(result.entries, 1);
  assert.equal(result.maxOpenPositionsObserved, 1);
  assert.equal(result.trades.find((trade) => trade.type === 'Entry').symbol, 'AAA');
});

test('portfolio simulation closes open positions at end of data', () => {
  const result = simulatePortfolioTrading({
    priceBySymbol: {
      AAA: [
        bar('2024-01-01', 10, 10, 9, 9.5),
        bar('2024-01-02', 10, 10, 9, 9.5),
        bar('2024-01-03', 10, 13, 10, 12.5),
        bar('2024-01-04', 12.5, 13, 12, 12.5),
      ],
    },
    initialCapital: 10000,
    riskPercent: 1,
    entryPeriod: 2,
    exitPeriod: 1,
    atrPeriod: 2,
    maxUnits: 3,
    maxOpenPositions: 1,
  });
  const exit = result.trades.find((trade) => trade.type === 'Exit');

  assert.equal(result.entries, 1);
  assert.equal(result.addedUnits, 2);
  assert.equal(exit.reason, 'end-of-data');
  assert.equal(result.finalEquity, result.initialCapital + exit.pnl);
});
