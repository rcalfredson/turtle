'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  calculateDonchian,
  calculateTurtleN,
  simulateTurtleTrading,
} = require('../lib/turtleStrategy');

const bar = (date, open, high, low, close) => ({
  date,
  open,
  high,
  low,
  close,
  volume: 1000,
});

test('Donchian channel excludes the current bar', () => {
  const prices = [
    bar('2024-01-01', 10, 11, 9, 10),
    bar('2024-01-02', 10, 12, 8, 11),
    bar('2024-01-03', 11, 20, 10, 19),
  ];

  const channel = calculateDonchian(prices, 2);

  assert.equal(channel[0], null);
  assert.equal(channel[1], null);
  assert.deepEqual(channel[2], {
    highestHigh: 12,
    lowestLow: 8,
  });
});

test('Turtle N starts as a simple average and then smooths true range', () => {
  const prices = [
    bar('2024-01-01', 10, 11, 9, 10),
    bar('2024-01-02', 10, 13, 9, 12),
    bar('2024-01-03', 12, 15, 11, 14),
    bar('2024-01-04', 14, 18, 13, 17),
  ];

  const n = calculateTurtleN(prices, 2);

  assert.equal(n.length, 2);
  assert.deepEqual(n[0], { index: 2, value: 4 });
  assert.deepEqual(n[1], { index: 3, value: 4.5 });
});

test('simulation uses running peaks for drawdown calculation', () => {
  const prices = [
    bar('2024-01-01', 9.5, 10, 9, 9.5),
    bar('2024-01-02', 9.5, 10, 9, 9.5),
    bar('2024-01-03', 10, 11, 10, 11),
    bar('2024-01-04', 12, 13, 12, 13),
  ];

  const result = simulateTurtleTrading({
    prices,
    initialCapital: 10000,
    riskPercent: 1,
    entryPeriod: 2,
    exitPeriod: 1,
    atrPeriod: 2,
    maxUnits: 1,
    allowShort: false,
  });

  assert.equal(result.drawdowns[0].drawdown, 0);
  assert.equal(result.maxDrawdown, 0);
  assert.ok(result.finalEquity > result.initialCapital);
});

test('simulation adds units on each half-N move up to maxUnits', () => {
  const prices = [
    bar('2024-01-01', 10, 10, 9, 9.5),
    bar('2024-01-02', 10, 10, 9, 9.5),
    bar('2024-01-03', 10, 13, 10, 12.5),
    bar('2024-01-04', 12.5, 13, 12, 12.5),
  ];

  const result = simulateTurtleTrading({
    prices,
    initialCapital: 10000,
    riskPercent: 1,
    entryPeriod: 2,
    exitPeriod: 1,
    atrPeriod: 2,
    maxUnits: 3,
    allowShort: false,
  });

  assert.equal(result.entries, 1);
  assert.equal(result.addedUnits, 2);
  assert.equal(result.trades.find((trade) => trade.type === 'Exit').units, 3);
});

test('exit trades attribute pnl to base and added units', () => {
  const prices = [
    bar('2024-01-01', 10, 10, 9, 9.5),
    bar('2024-01-02', 10, 10, 9, 9.5),
    bar('2024-01-03', 10, 13, 10, 12.5),
    bar('2024-01-04', 12.5, 13, 12, 12.5),
  ];

  const result = simulateTurtleTrading({
    prices,
    initialCapital: 10000,
    riskPercent: 1,
    entryPeriod: 2,
    exitPeriod: 1,
    atrPeriod: 2,
    maxUnits: 3,
    allowShort: false,
  });
  const exit = result.trades.find((trade) => trade.type === 'Exit');

  assert.equal(exit.unitPnls.length, 3);
  assert.equal(exit.basePnl, exit.unitPnls[0].pnl);
  assert.equal(
    exit.addPnl,
    exit.unitPnls.slice(1).reduce((sum, unit) => sum + unit.pnl, 0),
  );
  assert.equal(exit.pnl, exit.basePnl + exit.addPnl);
});
