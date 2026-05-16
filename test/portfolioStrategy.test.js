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

test('portfolio simulation can rank same-day entries by prior momentum', () => {
  const makePrices = ({ start, step }) => {
    const prices = [];
    const date = (index) => {
      const value = new Date('2024-01-01T00:00:00Z');
      value.setUTCDate(value.getUTCDate() + index);
      return value.toISOString().slice(0, 10);
    };

    for (let index = 0; index < 65; index += 1) {
      const close = start + (step * index);
      prices.push(bar(date(index), close, close, close - 1, close));
    }
    prices.push(bar(date(65), start + (step * 65), 20, start + (step * 65) - 1, 19));
    prices.push(bar(date(66), 19, 19, 18, 18.5));
    return prices;
  };

  const result = simulatePortfolioTrading({
    priceBySymbol: {
      AAA: makePrices({ start: 10, step: 0 }),
      BBB: makePrices({ start: 5, step: 0.1 }),
    },
    initialCapital: 10000,
    riskPercent: 1,
    entryPeriod: 2,
    exitPeriod: 1,
    atrPeriod: 2,
    maxUnits: 1,
    maxOpenPositions: 1,
    entryRank: 'momentum63',
  });

  assert.equal(result.entries, 1);
  assert.equal(result.trades.find((trade) => trade.type === 'Entry').symbol, 'BBB');
  assert.equal(result.parameters.entryRank, 'momentum63');
});

test('portfolio simulation can gate entries with a market regime filter', () => {
  const result = simulatePortfolioTrading({
    priceBySymbol: {
      AAA: [
        bar('2024-01-01', 10, 10, 9, 9.5),
        bar('2024-01-02', 10, 10, 9, 9.5),
        bar('2024-01-03', 10, 13, 10, 12.5),
        bar('2024-01-04', 13, 15, 12, 14),
      ],
    },
    marketRegimeSymbol: 'SPY',
    marketRegimeMa: 2,
    marketRegimePrices: [
      bar('2024-01-01', 10, 10, 10, 10),
      bar('2024-01-02', 8, 8, 8, 8),
      bar('2024-01-03', 11, 11, 11, 11),
      bar('2024-01-04', 12, 12, 12, 12),
    ],
    initialCapital: 10000,
    riskPercent: 1,
    entryPeriod: 2,
    exitPeriod: 1,
    atrPeriod: 2,
    maxUnits: 1,
    maxOpenPositions: 1,
  });
  const entry = result.trades.find((trade) => trade.type === 'Entry');

  assert.equal(result.entries, 1);
  assert.equal(entry.entryDate, '2024-01-04');
  assert.equal(result.marketRegime.blockedEntries, 1);
  assert.equal(result.marketRegime.activeDays, 1);
  assert.equal(result.marketRegime.inactiveDays, 3);
  assert.equal(result.parameters.marketRegimeSymbol, 'SPY');
  assert.equal(result.parameters.marketRegimeMa, 2);
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

test('portfolio simulation can fill long entries at the open after a gap above trigger', () => {
  const prices = [
    bar('2024-01-01', 10, 10, 9, 9.5),
    bar('2024-01-02', 10, 10, 9, 9.5),
    bar('2024-01-03', 11, 13, 10, 12.5),
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
    gapAwareFills: true,
    slippageBps: 100,
  });
  const entry = result.trades.find((trade) => trade.type === 'Entry');

  assert.equal(entry.triggerPrice, 10);
  assert.equal(entry.fillBasePrice, 11);
  assert.equal(entry.gapFilled, true);
  assert.equal(entry.entryPrice, 11.11);
  assert.equal(result.gapFills.gapFilledEntries, 1);
});

test('portfolio simulation can fill long exits at the open after a gap below trigger', () => {
  const prices = [
    bar('2024-01-01', 10, 10, 9, 9.5),
    bar('2024-01-02', 10, 10, 9, 9.5),
    bar('2024-01-03', 11, 13, 10, 12.5),
    bar('2024-01-04', 9, 9, 8, 8.5),
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
    gapAwareFills: true,
    slippageBps: 100,
  });
  const exit = result.trades.find((trade) => trade.type === 'Exit');

  assert.equal(exit.reason, 'channel');
  assert.equal(exit.triggerPrice, 10);
  assert.equal(exit.fillBasePrice, 9);
  assert.equal(exit.gapFilled, true);
  assert.equal(exit.exitPrice, 8.91);
  assert.equal(result.gapFills.gapFilledChannelExits, 1);
});
