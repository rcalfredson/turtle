'use strict';

const {
  calculateDonchian,
  calculateTurtleN,
} = require('./turtleStrategy');

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

const calculateUnitShares = ({ equity, riskPercent, n }) => {
  if (equity <= 0 || riskPercent <= 0 || n <= 0) {
    return 0;
  }

  const riskCapital = equity * (riskPercent / 100);
  return Math.floor(riskCapital / n);
};

const applyBuySlippage = (price, slippageBps) => price * (1 + (slippageBps / 10000));

const applySellSlippage = (price, slippageBps) => price * (1 - (slippageBps / 10000));

const calculateVolumeLimit = ({ volume, maxVolumeParticipationPct }) => {
  if (!Number.isFinite(volume) || volume < 0 || !Number.isFinite(maxVolumeParticipationPct)) {
    return Infinity;
  }

  return Math.floor(volume * (maxVolumeParticipationPct / 100));
};

const calculateVolumeParticipationPct = ({ shares, volume }) => {
  if (!Number.isFinite(volume) || volume <= 0) {
    return 0;
  }

  return safeNumber((shares / volume) * 100);
};

const createInitialPosition = ({ symbol, date, price, shares, n }) => ({
  symbol,
  direction: 'long',
  entryDate: date,
  units: [{
    entryDate: date,
    entryPrice: price,
    shares,
    n,
  }],
  totalShares: shares,
  totalCost: shares * price,
  lastAddPrice: price,
  n,
});

const addPositionUnit = ({ position, date, price, shares, n }) => {
  position.units.push({
    entryDate: date,
    entryPrice: price,
    shares,
    n,
  });
  position.totalShares += shares;
  position.totalCost += shares * price;
  position.lastAddPrice = price;
  position.n = n;
};

const closePosition = ({ position, date, price, reason }) => {
  const proceeds = position.totalShares * price;
  const pnl = proceeds - position.totalCost;
  const unitPnls = position.units.map((unit, index) => ({
    unitNumber: index + 1,
    entryDate: unit.entryDate,
    entryPrice: unit.entryPrice,
    shares: unit.shares,
    pnl: safeNumber(unit.shares * (price - unit.entryPrice)),
  }));
  const basePnl = unitPnls[0] ? unitPnls[0].pnl : 0;
  const addPnl = unitPnls.slice(1).reduce((sum, unit) => sum + unit.pnl, 0);

  return {
    symbol: position.symbol,
    entryDate: position.entryDate,
    exitDate: date,
    direction: position.direction,
    entryPrice: safeNumber(position.totalCost / position.totalShares),
    exitPrice: price,
    units: position.units.length,
    shares: position.totalShares,
    proceeds: safeNumber(proceeds),
    pnl: safeNumber(pnl),
    basePnl: safeNumber(basePnl),
    addPnl: safeNumber(addPnl),
    unitPnls,
    returnPct: position.totalCost > 0 ? safeNumber((pnl / position.totalCost) * 100) : 0,
    reason,
    type: 'Exit',
  };
};

const prepareSymbol = ({ symbol, prices, entryPeriod, exitPeriod, atrPeriod }) => {
  const sortedPrices = [...prices].sort((a, b) => a.date.localeCompare(b.date));
  const entryChannel = calculateDonchian(sortedPrices, entryPeriod);
  const exitChannel = calculateDonchian(sortedPrices, exitPeriod);
  const nSeries = calculateTurtleN(sortedPrices, atrPeriod);
  const rowsByDate = new Map();

  sortedPrices.forEach((bar, index) => {
    rowsByDate.set(bar.date, {
      bar,
      index,
      entry: entryChannel[index],
      exit: exitChannel[index],
      n: findIndicator(nSeries, index),
    });
  });

  return {
    symbol,
    sortedPrices,
    rowsByDate,
    lastClose: null,
  };
};

const calculateEquity = ({ cash, positions, symbolStates, date }) => {
  let marketValue = 0;
  positions.forEach((position, symbol) => {
    const state = symbolStates.get(symbol);
    const close = state.lastClose;
    if (Number.isFinite(close)) {
      marketValue += position.totalShares * close;
    }
  });

  return cash + marketValue;
};

const decorateTrade = ({ trade, cash, positions, symbolStates, date }) => ({
  ...trade,
  cashAfter: safeNumber(cash),
  equityAfter: safeNumber(calculateEquity({
    cash,
    positions,
    symbolStates,
    date,
  })),
  openPositionsAfter: positions.size,
});

const applyEntryLiquidityLimit = ({ shares, row, maxVolumeParticipationPct }) => {
  const volume = row.bar.volume;
  const maxVolumeShares = calculateVolumeLimit({
    volume,
    maxVolumeParticipationPct,
  });
  const constrainedShares = Math.min(shares, maxVolumeShares);

  return {
    shares: constrainedShares,
    desiredShares: shares,
    volume,
    maxVolumeShares,
    volumeConstrained: constrainedShares < shares,
    volumeParticipationPct: calculateVolumeParticipationPct({
      shares: constrainedShares,
      volume,
    }),
  };
};

const buildExitLiquidity = ({ shares, row, maxVolumeParticipationPct }) => {
  const volume = row && row.bar ? row.bar.volume : null;
  const maxVolumeShares = calculateVolumeLimit({
    volume,
    maxVolumeParticipationPct,
  });

  return {
    volume,
    maxVolumeShares,
    volumeConstrained: shares > maxVolumeShares,
    volumeParticipationPct: calculateVolumeParticipationPct({
      shares,
      volume,
    }),
  };
};

const simulatePortfolioTrading = ({
  priceBySymbol,
  initialCapital = 100000,
  riskPercent = 1,
  entryPeriod = 20,
  exitPeriod = 10,
  atrPeriod = 20,
  maxUnits = 4,
  maxOpenPositions = 10,
  allowShort = false,
  slippageBps = 0,
  maxVolumeParticipationPct = 1,
}) => {
  if (allowShort) {
    throw new Error('Portfolio simulation currently supports long-only trading');
  }

  const symbols = Object.keys(priceBySymbol || {}).sort();
  if (!symbols.length) {
    throw new Error('At least one symbol is required');
  }

  const symbolStates = new Map(symbols.map((symbol) => [
    symbol,
    prepareSymbol({
      symbol,
      prices: priceBySymbol[symbol],
      entryPeriod,
      exitPeriod,
      atrPeriod,
    }),
  ]));
  const dates = [...new Set(symbols.flatMap((symbol) => (
    symbolStates.get(symbol).sortedPrices.map((bar) => bar.date)
  )))].sort();

  if (!dates.length) {
    throw new Error('Price series is required');
  }

  let cash = initialCapital;
  const positions = new Map();
  const trades = [];
  const equityCurve = [];
  const exposureCurve = [];
  let maxOpenPositionsObserved = 0;
  let sizingEquity = initialCapital;
  const liquidity = {
    volumeConstrainedEntries: 0,
    volumeConstrainedAdds: 0,
    volumeConstrainedExits: 0,
    skippedForLiquidity: 0,
  };

  for (const date of dates) {
    const equityBeforeSignals = calculateEquity({
      cash,
      positions,
      symbolStates,
      date,
    });

    [...positions.keys()].sort().forEach((symbol) => {
      const state = symbolStates.get(symbol);
      const row = state.rowsByDate.get(date);
      const position = positions.get(symbol);
      if (!row || !position) {
        return;
      }

      const stopPrice = position.lastAddPrice - (2 * position.n);
      if (row.bar.low <= stopPrice) {
        const fillPrice = applySellSlippage(stopPrice, slippageBps);
        const trade = closePosition({
          position,
          date,
          price: fillPrice,
          reason: 'stop',
        });
        trade.triggerPrice = stopPrice;
        trade.slippageBps = slippageBps;
        Object.assign(trade, buildExitLiquidity({
          shares: position.totalShares,
          row,
          maxVolumeParticipationPct,
        }));
        if (trade.volumeConstrained) {
          liquidity.volumeConstrainedExits += 1;
        }
        cash += trade.proceeds;
        positions.delete(symbol);
        trades.push(decorateTrade({
          trade,
          cash,
          positions,
          symbolStates,
          date,
        }));
      }
    });

    [...positions.keys()].sort().forEach((symbol) => {
      const state = symbolStates.get(symbol);
      const row = state.rowsByDate.get(date);
      const position = positions.get(symbol);
      if (!row || !row.exit || !position) {
        return;
      }

      if (row.bar.low <= row.exit.lowestLow) {
        const fillPrice = applySellSlippage(row.exit.lowestLow, slippageBps);
        const trade = closePosition({
          position,
          date,
          price: fillPrice,
          reason: 'channel',
        });
        trade.triggerPrice = row.exit.lowestLow;
        trade.slippageBps = slippageBps;
        Object.assign(trade, buildExitLiquidity({
          shares: position.totalShares,
          row,
          maxVolumeParticipationPct,
        }));
        if (trade.volumeConstrained) {
          liquidity.volumeConstrainedExits += 1;
        }
        cash += trade.proceeds;
        positions.delete(symbol);
        trades.push(decorateTrade({
          trade,
          cash,
          positions,
          symbolStates,
          date,
        }));
      }
    });

    [...positions.keys()].sort().forEach((symbol) => {
      const state = symbolStates.get(symbol);
      const row = state.rowsByDate.get(date);
      const position = positions.get(symbol);
      if (!row || !row.n || !position || position.units.length >= maxUnits) {
        return;
      }

      let nextAddPrice = position.lastAddPrice + (0.5 * position.n);
      while (position.units.length < maxUnits && row.bar.high >= nextAddPrice) {
        const shares = calculateUnitShares({
          equity: sizingEquity,
          riskPercent,
          n: row.n,
        });
        const liquidityLimit = applyEntryLiquidityLimit({
          shares,
          row,
          maxVolumeParticipationPct,
        });
        if (liquidityLimit.shares < 1) {
          liquidity.skippedForLiquidity += 1;
          break;
        }

        const fillPrice = applyBuySlippage(nextAddPrice, slippageBps);
        const cost = liquidityLimit.shares * fillPrice;
        if (cost > cash) {
          break;
        }
        if (liquidityLimit.volumeConstrained) {
          liquidity.volumeConstrainedAdds += 1;
        }

        cash -= cost;
        addPositionUnit({
          position,
          date,
          price: fillPrice,
          shares: liquidityLimit.shares,
          n: row.n,
        });
        trades.push(decorateTrade({
          trade: {
            symbol,
            entryDate: date,
            entryPrice: fillPrice,
            triggerPrice: nextAddPrice,
            slippageBps,
            direction: 'long',
            shares: liquidityLimit.shares,
            desiredShares: liquidityLimit.desiredShares,
            volume: liquidityLimit.volume,
            maxVolumeShares: liquidityLimit.maxVolumeShares,
            volumeParticipationPct: liquidityLimit.volumeParticipationPct,
            volumeConstrained: liquidityLimit.volumeConstrained,
            unitNumber: position.units.length,
            cost: safeNumber(cost),
            type: 'Add',
          },
          cash,
          positions,
          symbolStates,
          date,
        }));

        nextAddPrice = position.lastAddPrice + (0.5 * position.n);
      }
    });

    symbols.forEach((symbol) => {
      if (positions.has(symbol) || positions.size >= maxOpenPositions) {
        return;
      }

      const state = symbolStates.get(symbol);
      const row = state.rowsByDate.get(date);
      if (!row || !row.entry || !row.n || row.bar.high <= row.entry.highestHigh) {
        return;
      }

      const entryPrice = row.entry.highestHigh;
      const shares = calculateUnitShares({
        equity: sizingEquity,
        riskPercent,
        n: row.n,
      });
      const liquidityLimit = applyEntryLiquidityLimit({
        shares,
        row,
        maxVolumeParticipationPct,
      });
      if (liquidityLimit.shares < 1) {
        liquidity.skippedForLiquidity += 1;
        return;
      }

      const fillPrice = applyBuySlippage(entryPrice, slippageBps);
      const cost = liquidityLimit.shares * fillPrice;
      if (cost > cash) {
        return;
      }
      if (liquidityLimit.volumeConstrained) {
        liquidity.volumeConstrainedEntries += 1;
      }

      cash -= cost;
      positions.set(symbol, createInitialPosition({
        symbol,
        date,
        price: fillPrice,
        shares: liquidityLimit.shares,
        n: row.n,
      }));
      maxOpenPositionsObserved = Math.max(maxOpenPositionsObserved, positions.size);
      trades.push(decorateTrade({
        trade: {
          symbol,
          entryDate: date,
          entryPrice: fillPrice,
          triggerPrice: entryPrice,
          slippageBps,
          direction: 'long',
          shares: liquidityLimit.shares,
          desiredShares: liquidityLimit.desiredShares,
          volume: liquidityLimit.volume,
          maxVolumeShares: liquidityLimit.maxVolumeShares,
          volumeParticipationPct: liquidityLimit.volumeParticipationPct,
          volumeConstrained: liquidityLimit.volumeConstrained,
          unitNumber: 1,
          cost: safeNumber(cost),
          type: 'Entry',
        },
        cash,
        positions,
        symbolStates,
        date,
      }));
    });

    symbols.forEach((symbol) => {
      const state = symbolStates.get(symbol);
      const row = state.rowsByDate.get(date);
      if (row) {
        state.lastClose = row.bar.close;
      }
    });

    const equity = calculateEquity({
      cash,
      positions,
      symbolStates,
      date,
    });
    const exposure = equity > 0 ? ((equity - cash) / equity) * 100 : 0;
    equityCurve.push({
      date,
      equity: safeNumber(equity),
      cash: safeNumber(cash),
      openPositions: positions.size,
    });
    exposureCurve.push({
      date,
      exposurePct: safeNumber(exposure),
      openPositions: positions.size,
    });

    if (!Number.isFinite(equityBeforeSignals)) {
      throw new Error(`Unable to calculate equity for ${date}`);
    }

    sizingEquity = equity;
  }

  if (positions.size) {
    const lastDate = dates[dates.length - 1];
    [...positions.keys()].sort().forEach((symbol) => {
      const state = symbolStates.get(symbol);
      const position = positions.get(symbol);
      const price = state.lastClose;
      if (!Number.isFinite(price)) {
        return;
      }

      const fillPrice = applySellSlippage(price, slippageBps);
      const trade = closePosition({
        position,
        date: lastDate,
        price: fillPrice,
        reason: 'end-of-data',
      });
      trade.triggerPrice = price;
      trade.slippageBps = slippageBps;
      Object.assign(trade, buildExitLiquidity({
        shares: position.totalShares,
        row: state.rowsByDate.get(lastDate),
        maxVolumeParticipationPct,
      }));
      if (trade.volumeConstrained) {
        liquidity.volumeConstrainedExits += 1;
      }
      cash += trade.proceeds;
      positions.delete(symbol);
      trades.push(decorateTrade({
        trade,
        cash,
        positions,
        symbolStates,
        date: lastDate,
      }));
    });

    const finalEquity = cash;
    equityCurve[equityCurve.length - 1] = {
      date: lastDate,
      equity: safeNumber(finalEquity),
      cash: safeNumber(cash),
      openPositions: 0,
    };
    exposureCurve[exposureCurve.length - 1] = {
      date: lastDate,
      exposurePct: 0,
      openPositions: 0,
    };
  }

  const finalEquity = equityCurve.length ? equityCurve[equityCurve.length - 1].equity : initialCapital;
  const drawdowns = calculateDrawdowns(equityCurve, initialCapital);
  const maxDrawdown = drawdowns.reduce((max, next) => Math.max(max, next.drawdown), 0);
  const entries = trades.filter((trade) => trade.type === 'Entry').length;
  const adds = trades.filter((trade) => trade.type === 'Add').length;
  const exits = trades.filter((trade) => trade.type === 'Exit');
  const wins = exits.filter((trade) => trade.pnl > 0).length;
  const averageExposure = exposureCurve.length
    ? exposureCurve.reduce((sum, point) => sum + point.exposurePct, 0) / exposureCurve.length
    : 0;

  return {
    initialCapital,
    finalEquity: safeNumber(finalEquity),
    totalTrades: exits.length,
    entries,
    addedUnits: adds,
    winningTrades: wins,
    winRate: exits.length ? safeNumber((wins / exits.length) * 100) : 0,
    maxDrawdown: safeNumber(maxDrawdown),
    averageExposurePct: safeNumber(averageExposure),
    maxOpenPositionsObserved,
    trades,
    equityCurve,
    exposureCurve,
    drawdowns,
    liquidity,
    parameters: {
      symbolCount: symbols.length,
      entryPeriod,
      exitPeriod,
      atrPeriod,
      riskPercent,
      maxUnits,
      maxOpenPositions,
      allowShort,
      slippageBps,
      maxVolumeParticipationPct,
      assumptions: [
        'Portfolio simulation is long-only.',
        'One cash account is shared across all symbols.',
        'Signals on the same day are processed alphabetically by symbol.',
        'Protective stops are evaluated before channel exits, add-ons, and new entries.',
        'Breakouts, exits, stops, and add-ons fill at trigger levels adjusted by fixed slippage.',
        'Entry and add-on order size is capped by max volume participation.',
        'Exit volume participation breaches are reported but exits are not blocked.',
      ],
    },
  };
};

module.exports = {
  simulatePortfolioTrading,
};
