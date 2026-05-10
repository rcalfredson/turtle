'use strict';

const calculateTrueRanges = (prices) => {
  const trs = [];
  for (let i = 1; i < prices.length; i += 1) {
    const today = prices[i];
    const prior = prices[i - 1];
    const highLow = today.high - today.low;
    const highClose = Math.abs(today.high - prior.close);
    const lowClose = Math.abs(today.low - prior.close);
    trs.push(Math.max(highLow, highClose, lowClose));
  }
  return trs;
};

const calculateAtr = (prices, period = 20) => {
  const trs = calculateTrueRanges(prices);
  if (trs.length < period) {
    return [];
  }

  const atr = [];
  for (let i = period - 1; i < trs.length; i += 1) {
    const window = trs.slice(i - period + 1, i + 1);
    const average = window.reduce((sum, value) => sum + value, 0) / period;
    atr.push({ index: i + 1, value: average });
  }

  return atr;
};

const calculateTurtleN = (prices, period = 20) => {
  const trs = calculateTrueRanges(prices);
  if (trs.length < period) {
    return [];
  }

  const nSeries = [];
  let n = trs.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  nSeries.push({ index: period, value: n });

  for (let i = period; i < trs.length; i += 1) {
    n = ((period - 1) * n + trs[i]) / period;
    nSeries.push({ index: i + 1, value: n });
  }

  return nSeries;
};

const calculateDonchian = (prices, lookback) => {
  return prices.map((_, idx) => {
    if (idx < lookback) {
      return null;
    }

    const slice = prices.slice(idx - lookback, idx);
    const highs = slice.map((bar) => bar.high);
    const lows = slice.map((bar) => bar.low);
    return {
      highestHigh: Math.max(...highs),
      lowestLow: Math.min(...lows),
    };
  });
};

const safeNumber = (value) => Number.isFinite(value) ? value : 0;

const findIndicator = (series, index) => {
  const row = series.find((item) => item.index === index);
  return row ? row.value : null;
};

const calculateDrawdowns = (equityCurve, initialCapital) => {
  let runningPeak = initialCapital;

  return equityCurve.map((point) => {
    runningPeak = Math.max(runningPeak, point.equity);
    return {
      date: point.date,
      drawdown: runningPeak > 0 ? ((runningPeak - point.equity) / runningPeak) * 100 : 0,
    };
  });
};

const createInitialPosition = ({ direction, date, price, units, n }) => {
  return {
    direction,
    entryDate: date,
    units: [{
      entryDate: date,
      entryPrice: price,
      shares: units,
      n,
    }],
    totalShares: units,
    totalCost: units * price,
    lastAddPrice: price,
    n,
  };
};

const addPositionUnit = ({ position, date, price, units, n }) => {
  position.units.push({
    entryDate: date,
    entryPrice: price,
    shares: units,
    n,
  });
  position.totalShares += units;
  position.totalCost += units * price;
  position.lastAddPrice = price;
  position.n = n;
};

const calculateOpenPnl = (position, price) => {
  if (!position) {
    return 0;
  }

  if (position.direction === 'long') {
    return position.totalShares * price - position.totalCost;
  }

  return position.totalCost - position.totalShares * price;
};

const calculateUnitPnl = ({ direction, unit, price }) => {
  if (direction === 'long') {
    return unit.shares * (price - unit.entryPrice);
  }

  return unit.shares * (unit.entryPrice - price);
};

const closePosition = ({ position, date, price, reason }) => {
  const pnl = calculateOpenPnl(position, price);
  const unitPnls = position.units.map((unit, index) => ({
    unitNumber: index + 1,
    entryDate: unit.entryDate,
    entryPrice: unit.entryPrice,
    shares: unit.shares,
    pnl: safeNumber(calculateUnitPnl({
      direction: position.direction,
      unit,
      price,
    })),
  }));
  const basePnl = unitPnls[0] ? unitPnls[0].pnl : 0;
  const addPnl = unitPnls.slice(1).reduce((sum, unit) => sum + unit.pnl, 0);

  return {
    entryDate: position.entryDate,
    exitDate: date,
    direction: position.direction,
    entryPrice: safeNumber(position.totalCost / position.totalShares),
    exitPrice: price,
    units: position.units.length,
    shares: position.totalShares,
    pnl: safeNumber(pnl),
    basePnl: safeNumber(basePnl),
    addPnl: safeNumber(addPnl),
    unitPnls,
    returnPct: position.totalCost > 0 ? safeNumber((pnl / position.totalCost) * 100) : 0,
    reason,
    type: 'Exit',
  };
};

const calculateUnitShares = ({ equity, riskPercent, n, price }) => {
  if (equity <= 0 || riskPercent <= 0 || n <= 0 || price <= 0) {
    return 0;
  }

  const riskCapital = equity * (riskPercent / 100);
  return Math.floor(riskCapital / n);
};

const simulateTurtleTrading = ({
  prices,
  initialCapital = 100000,
  riskPercent = 1,
  entryPeriod = 20,
  exitPeriod = 10,
  atrPeriod = 20,
  maxUnits = 4,
  allowShort = true,
}) => {
  if (!Array.isArray(prices) || prices.length === 0) {
    throw new Error('Price series is required');
  }

  const sortedPrices = [...prices].sort((a, b) => a.date.localeCompare(b.date));
  const nSeries = calculateTurtleN(sortedPrices, atrPeriod);
  const entryChannel = calculateDonchian(sortedPrices, entryPeriod);
  const exitChannel = calculateDonchian(sortedPrices, exitPeriod);

  const trades = [];
  let equity = initialCapital;
  let position = null;
  const equityCurve = [];

  for (let index = 0; index < sortedPrices.length; index += 1) {
    const bar = sortedPrices[index];
    const currentN = findIndicator(nSeries, index);
    const entry = entryChannel[index];
    const exit = exitChannel[index];

    if (position) {
      const stopPrice = position.direction === 'long'
        ? position.lastAddPrice - (2 * position.n)
        : position.lastAddPrice + (2 * position.n);
      const stopHit = position.direction === 'long'
        ? bar.low <= stopPrice
        : bar.high >= stopPrice;

      if (stopHit) {
        const trade = closePosition({
          position,
          date: bar.date,
          price: stopPrice,
          reason: 'stop',
        });
        equity += trade.pnl;
        trades.push(trade);
        position = null;
      }
    }

    if (position && exit) {
      const exitPrice = position.direction === 'long' ? exit.lowestLow : exit.highestHigh;
      const exitHit = position.direction === 'long'
        ? bar.low <= exit.lowestLow
        : bar.high >= exit.highestHigh;

      if (exitHit) {
        const trade = closePosition({
          position,
          date: bar.date,
          price: exitPrice,
          reason: 'channel',
        });
        equity += trade.pnl;
        trades.push(trade);
        position = null;
      }
    }

    if (position && currentN && position.units.length < maxUnits) {
      let nextAddPrice = position.direction === 'long'
        ? position.lastAddPrice + (0.5 * position.n)
        : position.lastAddPrice - (0.5 * position.n);

      while (position && position.units.length < maxUnits) {
        const addHit = position.direction === 'long'
          ? bar.high >= nextAddPrice
          : bar.low <= nextAddPrice;
        if (!addHit) {
          break;
        }

        const units = calculateUnitShares({
          equity,
          riskPercent,
          n: currentN,
          price: nextAddPrice,
        });
        const cost = units * nextAddPrice;
        if (units < 1 || cost > equity) {
          break;
        }

        addPositionUnit({
          position,
          date: bar.date,
          price: nextAddPrice,
          units,
          n: currentN,
        });
        trades.push({
          entryDate: bar.date,
          entryPrice: nextAddPrice,
          direction: position.direction,
          shares: units,
          unitNumber: position.units.length,
          type: 'Add',
        });

        nextAddPrice = position.direction === 'long'
          ? position.lastAddPrice + (0.5 * position.n)
          : position.lastAddPrice - (0.5 * position.n);
      }
    }

    if (!position && entry && currentN && bar.high > entry.highestHigh) {
      const entryPrice = entry.highestHigh;
      const units = calculateUnitShares({
        equity,
        riskPercent,
        n: currentN,
        price: entryPrice,
      });
      const cost = units * entryPrice;
      if (units > 0 && cost <= equity) {
        position = createInitialPosition({
          direction: 'long',
          date: bar.date,
          price: entryPrice,
          units,
          n: currentN,
        });
        trades.push({
          entryDate: bar.date,
          entryPrice,
          direction: 'long',
          shares: units,
          unitNumber: 1,
          type: 'Entry',
        });
      }
    }

    if (!position && allowShort && entry && currentN && bar.low < entry.lowestLow) {
      const entryPrice = entry.lowestLow;
      const units = calculateUnitShares({
        equity,
        riskPercent,
        n: currentN,
        price: entryPrice,
      });
      const cost = units * entryPrice;
      if (units > 0 && cost <= equity) {
        position = createInitialPosition({
          direction: 'short',
          date: bar.date,
          price: entryPrice,
          units,
          n: currentN,
        });
        trades.push({
          entryDate: bar.date,
          entryPrice,
          direction: 'short',
          shares: units,
          unitNumber: 1,
          type: 'Entry',
        });
      }
    }

    equityCurve.push({
      date: bar.date,
      equity: equity + calculateOpenPnl(position, bar.close),
    });
  }

  if (position && sortedPrices.length) {
    const lastBar = sortedPrices[sortedPrices.length - 1];
    const trade = closePosition({
      position,
      date: lastBar.date,
      price: lastBar.close,
      reason: 'end-of-data',
    });
    equity += trade.pnl;
    trades.push(trade);
    position = null;

    if (equityCurve.length) {
      equityCurve[equityCurve.length - 1] = {
        date: lastBar.date,
        equity,
      };
    }
  }

  const finalEquity = equityCurve.length ? equityCurve[equityCurve.length - 1].equity : initialCapital;
  const drawdowns = calculateDrawdowns(equityCurve, initialCapital);
  const maxDrawdown = drawdowns.reduce((max, next) => Math.max(max, next.drawdown), 0);
  const entries = trades.filter((trade) => trade.type === 'Entry').length;
  const adds = trades.filter((trade) => trade.type === 'Add').length;
  const exits = trades.filter((trade) => trade.type === 'Exit');
  const wins = exits.filter((trade) => trade.pnl > 0).length;

  return {
    initialCapital,
    finalEquity: safeNumber(finalEquity),
    totalTrades: exits.length,
    entries,
    addedUnits: adds,
    winningTrades: wins,
    winRate: exits.length ? safeNumber((wins / exits.length) * 100) : 0,
    maxDrawdown: safeNumber(maxDrawdown),
    trades,
    equityCurve,
    drawdowns,
    parameters: {
      entryPeriod,
      exitPeriod,
      atrPeriod,
      riskPercent,
      maxUnits,
      allowShort,
      assumptions: [
        'Daily OHLC bars are used; intraday event order is unknown.',
        'Protective stops are evaluated before channel exits, add-ons, and new entries.',
        'Breakouts, exits, stops, and add-ons fill at their trigger levels.',
      ],
    },
  };
};

module.exports = {
  calculateAtr,
  calculateDonchian,
  calculateTurtleN,
  simulateTurtleTrading,
};
