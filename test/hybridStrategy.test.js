'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { combineEquityCurves } = require('../lib/hybridStrategy');

test('hybrid strategy combines core and active equity curves', () => {
  const result = combineEquityCurves({
    initialCapital: 1000,
    coreResult: {
      equityCurve: [
        { date: '2024-01-01', equity: 800, cash: 0, exposurePct: 100, positions: 1 },
        { date: '2024-01-02', equity: 880, cash: 0, exposurePct: 100, positions: 1 },
      ],
    },
    activeResult: {
      equityCurve: [
        { date: '2024-01-01', equity: 200, cash: 50, openPositions: 1 },
        { date: '2024-01-02', equity: 190, cash: 100, openPositions: 1 },
      ],
      exposureCurve: [
        { date: '2024-01-01', exposurePct: 75, openPositions: 1 },
        { date: '2024-01-02', exposurePct: 47.3684210526, openPositions: 1 },
      ],
    },
  });

  assert.equal(result.startDate, '2024-01-01');
  assert.equal(result.endDate, '2024-01-02');
  assert.equal(result.finalEquity, 1070);
  assert.equal(result.coreFinalEquity, 880);
  assert.equal(result.activeFinalEquity, 190);
  assert.equal(result.equityCurve.length, 2);
  assert.equal(result.equityCurve[0].equity, 1000);
  assert.equal(result.equityCurve[0].cash, 50);
  assert.equal(result.equityCurve[0].exposurePct, 95);
  assert.equal(Math.round(result.equityCurve[1].exposurePct * 100) / 100, 90.65);
});

test('hybrid strategy starts on the first common equity date', () => {
  const result = combineEquityCurves({
    initialCapital: 1000,
    coreResult: {
      equityCurve: [
        { date: '2024-01-01', equity: 800, cash: 0, exposurePct: 100, positions: 1 },
        { date: '2024-01-02', equity: 880, cash: 0, exposurePct: 100, positions: 1 },
      ],
    },
    activeResult: {
      equityCurve: [
        { date: '2024-01-02', equity: 200, cash: 200, openPositions: 0 },
      ],
      exposureCurve: [
        { date: '2024-01-02', exposurePct: 0, openPositions: 0 },
      ],
    },
  });

  assert.equal(result.startDate, '2024-01-02');
  assert.equal(result.finalEquity, 1080);
});
