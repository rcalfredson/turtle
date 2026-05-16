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

const validEntryRanks = ['alphabetical', 'momentum63', 'momentum126'];

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

const resolveBuyFillBase = ({ triggerPrice, open, gapAwareFills }) => {
  const gapFilled = Boolean(gapAwareFills && Number.isFinite(open) && open > triggerPrice);
  return {
    fillBasePrice: gapFilled ? open : triggerPrice,
    gapFilled,
  };
};

const resolveSellFillBase = ({ triggerPrice, open, gapAwareFills }) => {
  const gapFilled = Boolean(gapAwareFills && Number.isFinite(open) && open < triggerPrice);
  return {
    fillBasePrice: gapFilled ? open : triggerPrice,
    gapFilled,
  };
};

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
      momentum63: calculatePriorMomentum({ prices: sortedPrices, index, lookback: 63 }),
      momentum126: calculatePriorMomentum({ prices: sortedPrices, index, lookback: 126 }),
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

const calculatePriorMomentum = ({ prices, index, lookback }) => {
  const priorIndex = index - 1;
  const startIndex = priorIndex - lookback;
  if (startIndex < 0) {
    return null;
  }

  const priorClose = prices[priorIndex] ? prices[priorIndex].close : null;
  const startClose = prices[startIndex] ? prices[startIndex].close : null;
  if (!Number.isFinite(priorClose) || !Number.isFinite(startClose) || startClose <= 0) {
    return null;
  }

  return (priorClose / startClose) - 1;
};

const calculatePriorSma = ({ prices, index, lookback }) => {
  const priorIndex = index - 1;
  const startIndex = priorIndex - lookback + 1;
  if (startIndex < 0) {
    return null;
  }

  const closes = prices.slice(startIndex, priorIndex + 1).map((bar) => bar.close);
  if (closes.some((close) => !Number.isFinite(close))) {
    return null;
  }

  return closes.reduce((sum, close) => sum + close, 0) / closes.length;
};

const prepareMarketRegime = ({ prices, maPeriod }) => {
  if (!Array.isArray(prices) || !prices.length || !Number.isInteger(maPeriod) || maPeriod < 1) {
    return null;
  }

  const sortedPrices = [...prices].sort((a, b) => a.date.localeCompare(b.date));
  const rowsByDate = new Map();

  sortedPrices.forEach((bar, index) => {
    const priorClose = index > 0 ? sortedPrices[index - 1].close : null;
    const priorSma = calculatePriorSma({
      prices: sortedPrices,
      index,
      lookback: maPeriod,
    });

    rowsByDate.set(bar.date, {
      active: Number.isFinite(priorClose) && Number.isFinite(priorSma) && priorClose > priorSma,
      priorClose,
      priorSma,
    });
  });

  return {
    maPeriod,
    rowsByDate,
  };
};

const prepareRelativeStrength = ({ prices, lookback }) => {
  if (!Array.isArray(prices) || !prices.length || !Number.isInteger(lookback) || lookback < 1) {
    return null;
  }

  const sortedPrices = [...prices].sort((a, b) => a.date.localeCompare(b.date));
  const rowsByDate = new Map();

  sortedPrices.forEach((bar, index) => {
    rowsByDate.set(bar.date, {
      momentum: calculatePriorMomentum({ prices: sortedPrices, index, lookback }),
    });
  });

  return {
    lookback,
    rowsByDate,
  };
};

const validateEntryRank = (entryRank) => {
  if (!validEntryRanks.includes(entryRank)) {
    throw new Error(`entryRank must be one of: ${validEntryRanks.join(', ')}`);
  }
};

const getEntryRankScore = ({ row, entryRank }) => {
  if (entryRank === 'momentum63') {
    return row.momentum63;
  }

  if (entryRank === 'momentum126') {
    return row.momentum126;
  }

  return null;
};

const compareEntryCandidates = (entryRank) => (left, right) => {
  if (entryRank !== 'alphabetical') {
    const leftScore = getEntryRankScore({ row: left.row, entryRank });
    const rightScore = getEntryRankScore({ row: right.row, entryRank });
    const leftValid = Number.isFinite(leftScore);
    const rightValid = Number.isFinite(rightScore);

    if (leftValid && rightValid && leftScore !== rightScore) {
      return rightScore - leftScore;
    }

    if (leftValid !== rightValid) {
      return leftValid ? -1 : 1;
    }
  }

  return left.symbol.localeCompare(right.symbol);
};

const getPriorMomentum = ({ state, row, lookback }) => {
  if (lookback === 63) {
    return row.momentum63;
  }

  if (lookback === 126) {
    return row.momentum126;
  }

  return calculatePriorMomentum({
    prices: state.sortedPrices,
    index: row.index,
    lookback,
  });
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
  gapAwareFills = false,
  entryRank = 'alphabetical',
  marketRegimeSymbol = null,
  marketRegimePrices = null,
  marketRegimeMa = 0,
  relativeStrengthSymbol = null,
  relativeStrengthPrices = null,
  relativeStrengthLookback = 0,
}) => {
  if (allowShort) {
    throw new Error('Portfolio simulation currently supports long-only trading');
  }

  validateEntryRank(entryRank);
  if (!Number.isInteger(marketRegimeMa) || marketRegimeMa < 0) {
    throw new Error('marketRegimeMa must be a non-negative integer');
  }
  if (!Number.isInteger(relativeStrengthLookback) || relativeStrengthLookback < 0) {
    throw new Error('relativeStrengthLookback must be a non-negative integer');
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
  const marketRegimeState = marketRegimeSymbol && marketRegimeMa > 0
    ? prepareMarketRegime({ prices: marketRegimePrices, maPeriod: marketRegimeMa })
    : null;
  if (marketRegimeSymbol && marketRegimeMa > 0 && !marketRegimeState) {
    throw new Error('marketRegimePrices are required when marketRegimeSymbol and marketRegimeMa are set');
  }
  const relativeStrengthState = relativeStrengthSymbol && relativeStrengthLookback > 0
    ? prepareRelativeStrength({ prices: relativeStrengthPrices, lookback: relativeStrengthLookback })
    : null;
  if (relativeStrengthSymbol && relativeStrengthLookback > 0 && !relativeStrengthState) {
    throw new Error('relativeStrengthPrices are required when relativeStrengthSymbol and relativeStrengthLookback are set');
  }

  if (!dates.length) {
    throw new Error('Price series is required');
  }

  let cash = initialCapital;
  const positions = new Map();
  const trades = [];
  const equityCurve = [];
  const exposureCurve = [];
  const marketRegimeCurve = [];
  let maxOpenPositionsObserved = 0;
  let sizingEquity = initialCapital;
  const liquidity = {
    volumeConstrainedEntries: 0,
    volumeConstrainedAdds: 0,
    volumeConstrainedExits: 0,
    skippedForLiquidity: 0,
  };
  const gapFills = {
    gapFilledEntries: 0,
    gapFilledAdds: 0,
    gapFilledStops: 0,
    gapFilledChannelExits: 0,
  };
  const marketRegime = {
    enabled: Boolean(marketRegimeState),
    symbol: marketRegimeState ? marketRegimeSymbol : '',
    maPeriod: marketRegimeState ? marketRegimeMa : 0,
    activeDays: 0,
    inactiveDays: 0,
    blockedEntries: 0,
    blockedAdds: 0,
  };
  const relativeStrength = {
    enabled: Boolean(relativeStrengthState),
    symbol: relativeStrengthState ? relativeStrengthSymbol : '',
    lookback: relativeStrengthState ? relativeStrengthLookback : 0,
    blockedEntries: 0,
    missingBenchmarkDays: 0,
    missingSymbolMomentum: 0,
  };

  for (const date of dates) {
    const marketRegimeRow = marketRegimeState ? marketRegimeState.rowsByDate.get(date) : null;
    const marketRegimeActive = marketRegimeState ? Boolean(marketRegimeRow && marketRegimeRow.active) : true;
    if (marketRegimeState) {
      if (marketRegimeActive) {
        marketRegime.activeDays += 1;
      } else {
        marketRegime.inactiveDays += 1;
      }
    }
    const relativeStrengthRow = relativeStrengthState ? relativeStrengthState.rowsByDate.get(date) : null;

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
        const fill = resolveSellFillBase({
          triggerPrice: stopPrice,
          open: row.bar.open,
          gapAwareFills,
        });
        const fillPrice = applySellSlippage(fill.fillBasePrice, slippageBps);
        const trade = closePosition({
          position,
          date,
          price: fillPrice,
          reason: 'stop',
        });
        trade.triggerPrice = stopPrice;
        trade.fillBasePrice = fill.fillBasePrice;
        trade.gapFilled = fill.gapFilled;
        trade.slippageBps = slippageBps;
        if (fill.gapFilled) {
          gapFills.gapFilledStops += 1;
        }
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
        const fill = resolveSellFillBase({
          triggerPrice: row.exit.lowestLow,
          open: row.bar.open,
          gapAwareFills,
        });
        const fillPrice = applySellSlippage(fill.fillBasePrice, slippageBps);
        const trade = closePosition({
          position,
          date,
          price: fillPrice,
          reason: 'channel',
        });
        trade.triggerPrice = row.exit.lowestLow;
        trade.fillBasePrice = fill.fillBasePrice;
        trade.gapFilled = fill.gapFilled;
        trade.slippageBps = slippageBps;
        if (fill.gapFilled) {
          gapFills.gapFilledChannelExits += 1;
        }
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
      if (!marketRegimeActive) {
        if (row.bar.high >= nextAddPrice) {
          marketRegime.blockedAdds += 1;
        }
        return;
      }

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

        const fill = resolveBuyFillBase({
          triggerPrice: nextAddPrice,
          open: row.bar.open,
          gapAwareFills,
        });
        const fillPrice = applyBuySlippage(fill.fillBasePrice, slippageBps);
        const cost = liquidityLimit.shares * fillPrice;
        if (cost > cash) {
          break;
        }
        if (liquidityLimit.volumeConstrained) {
          liquidity.volumeConstrainedAdds += 1;
        }
        if (fill.gapFilled) {
          gapFills.gapFilledAdds += 1;
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
            fillBasePrice: fill.fillBasePrice,
            gapFilled: fill.gapFilled,
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

    const rawEntryCandidates = symbols.map((symbol) => {
      if (positions.has(symbol)) {
        return;
      }

      const state = symbolStates.get(symbol);
      const row = state.rowsByDate.get(date);
      if (!row || !row.entry || !row.n || row.bar.high <= row.entry.highestHigh) {
        return;
      }

      return {
        symbol,
        state,
        row,
      };
    }).filter(Boolean);

    if (!marketRegimeActive) {
      marketRegime.blockedEntries += rawEntryCandidates.length;
    }

    const relativeStrengthCandidates = marketRegimeActive && relativeStrengthState
      ? rawEntryCandidates.filter(({ state, row }) => {
        const benchmarkMomentum = relativeStrengthRow ? relativeStrengthRow.momentum : null;
        const symbolMomentum = getPriorMomentum({
          state,
          row,
          lookback: relativeStrengthLookback,
        });

        if (!Number.isFinite(benchmarkMomentum)) {
          relativeStrength.missingBenchmarkDays += 1;
          relativeStrength.blockedEntries += 1;
          return false;
        }

        if (!Number.isFinite(symbolMomentum)) {
          relativeStrength.missingSymbolMomentum += 1;
          relativeStrength.blockedEntries += 1;
          return false;
        }

        if (symbolMomentum <= benchmarkMomentum) {
          relativeStrength.blockedEntries += 1;
          return false;
        }

        return true;
      })
      : rawEntryCandidates;

    const entryCandidates = marketRegimeActive
      ? relativeStrengthCandidates.sort(compareEntryCandidates(entryRank))
      : [];

    entryCandidates.forEach(({ symbol, row }) => {
      if (positions.size >= maxOpenPositions) {
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

      const fill = resolveBuyFillBase({
        triggerPrice: entryPrice,
        open: row.bar.open,
        gapAwareFills,
      });
      const fillPrice = applyBuySlippage(fill.fillBasePrice, slippageBps);
      const cost = liquidityLimit.shares * fillPrice;
      if (cost > cash) {
        return;
      }
      if (liquidityLimit.volumeConstrained) {
        liquidity.volumeConstrainedEntries += 1;
      }
      if (fill.gapFilled) {
        gapFills.gapFilledEntries += 1;
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
          fillBasePrice: fill.fillBasePrice,
          gapFilled: fill.gapFilled,
          slippageBps,
          entryRank,
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
    marketRegimeCurve.push({
      date,
      active: marketRegimeActive,
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
      trade.fillBasePrice = price;
      trade.gapFilled = false;
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
    marketRegimeCurve,
    drawdowns,
    liquidity,
    gapFills,
    marketRegime: {
      ...marketRegime,
      activeDaysPct: marketRegime.activeDays + marketRegime.inactiveDays > 0
        ? safeNumber((marketRegime.activeDays / (marketRegime.activeDays + marketRegime.inactiveDays)) * 100)
        : 100,
    },
    relativeStrength,
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
      gapAwareFills,
      entryRank,
      marketRegimeSymbol: marketRegime.symbol,
      marketRegimeMa: marketRegime.maPeriod,
      relativeStrengthSymbol: relativeStrength.symbol,
      relativeStrengthLookback: relativeStrength.lookback,
      assumptions: [
        'Portfolio simulation is long-only.',
        'One cash account is shared across all symbols.',
        'Signals on the same day are processed by the configured entryRank.',
        'Market regime filters block new entries and add-ons only; exits remain active.',
        'Relative strength filters block new entries only; add-ons and exits remain active.',
        'Protective stops are evaluated before channel exits, add-ons, and new entries.',
        'Breakouts, exits, stops, and add-ons fill at trigger levels, or at the open when gap-aware fills are enabled and the open has crossed the trigger.',
        'Fixed slippage is applied after resolving the trigger or gap-aware fill base.',
        'Entry and add-on order size is capped by max volume participation.',
        'Exit volume participation breaches are reported but exits are not blocked.',
      ],
    },
  };
};

module.exports = {
  simulatePortfolioTrading,
};
