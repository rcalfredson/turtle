'use strict';

const safeNumber = (value) => Number.isFinite(value) ? value : 0;

const sortPrices = (prices) => [...prices].sort((a, b) => a.date.localeCompare(b.date));

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

const getCommonStartDate = (seriesBySymbol) => {
  const firstDates = [...seriesBySymbol.values()].map((prices) => prices[0] && prices[0].date);
  if (firstDates.some((date) => !date)) {
    throw new Error('Each benchmark symbol requires price data');
  }

  return firstDates.sort().at(-1);
};

const getDatesFrom = (seriesBySymbol, startDate) => {
  const dates = new Set();
  seriesBySymbol.forEach((prices) => {
    prices.forEach((bar) => {
      if (bar.date >= startDate) {
        dates.add(bar.date);
      }
    });
  });

  return [...dates].sort();
};

const simulateBuyAndHold = ({
  priceBySymbol,
  initialCapital = 100000,
}) => {
  const symbols = Object.keys(priceBySymbol || {}).sort();
  if (!symbols.length) {
    throw new Error('At least one benchmark symbol is required');
  }

  const seriesBySymbol = new Map(symbols.map((symbol) => [
    symbol,
    sortPrices(priceBySymbol[symbol] || []),
  ]));
  const startDate = getCommonStartDate(seriesBySymbol);
  const dates = getDatesFrom(seriesBySymbol, startDate);
  if (!dates.length) {
    throw new Error('Benchmark price series is required');
  }

  const allocation = initialCapital / symbols.length;
  let cash = initialCapital;
  const sharesBySymbol = new Map();
  const lastCloseBySymbol = new Map();

  symbols.forEach((symbol) => {
    const prices = seriesBySymbol.get(symbol);
    const firstBar = prices.find((bar) => bar.date >= startDate && Number.isFinite(bar.close));
    if (!firstBar || firstBar.close <= 0) {
      throw new Error(`Unable to find start price for ${symbol}`);
    }

    const shares = allocation / firstBar.close;
    sharesBySymbol.set(symbol, shares);
    lastCloseBySymbol.set(symbol, firstBar.close);
    cash -= shares * firstBar.close;
  });

  const rowsBySymbol = new Map(symbols.map((symbol) => [
    symbol,
    new Map(seriesBySymbol.get(symbol).map((bar) => [bar.date, bar])),
  ]));
  const equityCurve = [];

  dates.forEach((date) => {
    symbols.forEach((symbol) => {
      const bar = rowsBySymbol.get(symbol).get(date);
      if (bar && Number.isFinite(bar.close)) {
        lastCloseBySymbol.set(symbol, bar.close);
      }
    });

    const marketValue = symbols.reduce((sum, symbol) => (
      sum + (sharesBySymbol.get(symbol) * lastCloseBySymbol.get(symbol))
    ), 0);

    equityCurve.push({
      date,
      equity: safeNumber(cash + marketValue),
      cash: safeNumber(cash),
      exposurePct: 100,
      positions: symbols.length,
    });
  });

  const finalEquity = equityCurve.length ? equityCurve[equityCurve.length - 1].equity : initialCapital;
  const drawdowns = calculateDrawdowns(equityCurve, initialCapital);
  const maxDrawdown = drawdowns.reduce((max, point) => Math.max(max, point.drawdown), 0);

  return {
    initialCapital,
    finalEquity: safeNumber(finalEquity),
    startDate,
    endDate: equityCurve[equityCurve.length - 1].date,
    symbols,
    equityCurve,
    drawdowns,
    maxDrawdown: safeNumber(maxDrawdown),
    averageExposurePct: 100,
  };
};

module.exports = {
  simulateBuyAndHold,
};
