'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { simulatePortfolioTrading } = require('../lib/portfolioStrategy');

const bar = (date, open, high, low, close, volume = 1000) => ({
  date,
  open,
  high,
  low,
  close,
  volume,
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

test('portfolio simulation applies slippage against buys and sells', () => {
  const prices = [
    bar('2024-01-01', 10, 10, 9, 9.5),
    bar('2024-01-02', 10, 10, 9, 9.5),
    bar('2024-01-03', 10, 13, 10, 12.5),
    bar('2024-01-04', 12.5, 13, 12, 12.5),
  ];

  const result = simulatePortfolioTrading({
    priceBySymbol: { AAA: prices },
    initialCapital: 10000,
    riskPercent: 1,
    entryPeriod: 2,
    exitPeriod: 1,
    atrPeriod: 2,
    maxUnits: 1,
    maxOpenPositions: 1,
    slippageBps: 100,
  });
  const entry = result.trades.find((trade) => trade.type === 'Entry');
  const exit = result.trades.find((trade) => trade.type === 'Exit');

  assert.equal(entry.triggerPrice, 10);
  assert.equal(entry.entryPrice, 10.1);
  assert.equal(exit.triggerPrice, 12.5);
  assert.equal(exit.exitPrice, 12.375);
});

test('portfolio simulation caps entries by max volume participation', () => {
  const prices = [
    bar('2024-01-01', 10, 10, 9, 9.5, 1000),
    bar('2024-01-02', 10, 10, 9, 9.5, 1000),
    bar('2024-01-03', 10, 13, 10, 12.5, 10),
    bar('2024-01-04', 12.5, 13, 12, 12.5, 2),
  ];

  const result = simulatePortfolioTrading({
    priceBySymbol: { AAA: prices },
    initialCapital: 10000,
    riskPercent: 1,
    entryPeriod: 2,
    exitPeriod: 1,
    atrPeriod: 2,
    maxUnits: 1,
    maxOpenPositions: 1,
    maxVolumeParticipationPct: 50,
  });
  const entry = result.trades.find((trade) => trade.type === 'Entry');
  const exit = result.trades.find((trade) => trade.type === 'Exit');

  assert.equal(entry.shares, 5);
  assert.equal(entry.maxVolumeShares, 5);
  assert.equal(entry.volumeConstrained, true);
  assert.equal(entry.volumeParticipationPct, 50);
  assert.equal(entry.desiredShares > entry.shares, true);
  assert.equal(exit.volumeConstrained, true);
  assert.equal(result.liquidity.volumeConstrainedEntries, 1);
  assert.equal(result.liquidity.volumeConstrainedExits, 1);
});
