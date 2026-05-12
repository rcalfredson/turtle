#!/usr/bin/env node
'use strict';

const fs = require('fs/promises');
const path = require('path');
const dotenv = require('dotenv');

const dataProvider = require('../lib/dataProvider');
const turtleStrategy = require('../lib/turtleStrategy');

dotenv.config();

const defaultSymbols = [
  'AAPL', 'MSFT', 'NVDA', 'AMZN', 'META', 'GOOGL',
  'JPM', 'XOM', 'UNH', 'COST', 'LLY', 'CAT',
  'SPY', 'QQQ', 'IWM', 'DIA', 'XLE', 'XLK',
];

const defaultRanges = [
  { from: '2020-01-01', to: '2024-12-31' },
  { from: '2021-01-01', to: '2023-12-31' },
  { from: '2022-01-01', to: '2024-12-31' },
  { from: '2023-01-01', to: '2026-05-01' },
];

const csvColumns = [
  'symbol',
  'from',
  'to',
  'bars',
  'firstBar',
  'lastBar',
  'initialCapital',
  'riskPercent',
  'allowShort',
  'maxUnits',
  'finalEquity',
  'totalReturnPct',
  'maxDrawdownPct',
  'returnToMaxDrawdown',
  'cagrPct',
  'equityVolatilityPct',
  'sharpe',
  'sortino',
  'totalTrades',
  'entries',
  'longEntries',
  'shortEntries',
  'longTrades',
  'shortTrades',
  'longPnl',
  'shortPnl',
  'longWinRatePct',
  'shortWinRatePct',
  'longAvgTrade',
  'shortAvgTrade',
  'addedUnits',
  'winningTrades',
  'losingTrades',
  'winRatePct',
  'profitFactor',
  'averageWin',
  'averageLoss',
  'medianTradePnl',
  'largestWin',
  'largestWinPctOfGrossProfit',
  'largestWinPctOfNetPnl',
  'baseUnitPnl',
  'addedUnitPnl',
  'stopExits',
  'channelExits',
  'endOfDataExits',
  'totalPnl',
  'error',
];

const printUsage = () => {
  console.log(`
Usage:
  node scripts/runMatrix.js [options]

Options:
  --output=PATH                  CSV output path
  --symbols=AAPL,MSFT,SPY        Comma-separated symbols
  --ranges=FROM:TO,FROM:TO       Comma-separated date ranges
  --initialCapital=100000        Starting capital
  --riskPercent=1                Risk percent per trade
  --allowShort=true              Enable short entries (true or false)
  --maxUnits=4                   Max position units; comma-separated values run a sweep
  --limit=5                      Run only the first N combinations
  --dry-run                      Print planned combinations without fetching data
  --help                         Show this help

Examples:
  node scripts/runMatrix.js --limit=3
  node scripts/runMatrix.js --symbols=AAPL,SPY --ranges=2020-01-01:2024-12-31
`);
};

const parseArgs = (argv) => {
  const options = {
    symbols: defaultSymbols,
    ranges: defaultRanges,
    initialCapital: Number(process.env.STARTING_CAPITAL) || 100000,
    riskPercent: Number(process.env.RISK_PERCENT) || 1,
    allowShort: process.env.ALLOW_SHORT === undefined ? true : parseBoolean(process.env.ALLOW_SHORT, 'ALLOW_SHORT'),
    maxUnits: parsePositiveIntegerList(process.env.MAX_UNITS || '4', 'MAX_UNITS'),
    limit: null,
    output: null,
    dryRun: false,
    help: false,
  };

  argv.forEach((arg) => {
    if (arg === '--help' || arg === '-h') {
      options.help = true;
      return;
    }

    if (arg === '--dry-run') {
      options.dryRun = true;
      return;
    }

    const [key, value] = arg.split('=');
    if (!value) {
      throw new Error(`Invalid option: ${arg}`);
    }

    if (key === '--output') {
      options.output = value;
    } else if (key === '--symbols') {
      options.symbols = value.split(',').map((symbol) => symbol.trim().toUpperCase()).filter(Boolean);
    } else if (key === '--ranges') {
      options.ranges = value.split(',').map((range) => {
        const [from, to] = range.split(':');
        if (!from || !to) {
          throw new Error(`Invalid range: ${range}`);
        }

        return { from, to };
      });
    } else if (key === '--initialCapital') {
      options.initialCapital = Number(value);
    } else if (key === '--riskPercent') {
      options.riskPercent = Number(value);
    } else if (key === '--allowShort') {
      options.allowShort = parseBoolean(value, 'allowShort');
    } else if (key === '--maxUnits') {
      options.maxUnits = parsePositiveIntegerList(value, 'maxUnits');
    } else if (key === '--limit') {
      options.limit = Number(value);
    } else {
      throw new Error(`Unknown option: ${key}`);
    }
  });

  if (!Number.isFinite(options.initialCapital) || options.initialCapital <= 0) {
    throw new Error('initialCapital must be a positive number');
  }

  if (!Number.isFinite(options.riskPercent) || options.riskPercent <= 0) {
    throw new Error('riskPercent must be a positive number');
  }

  if (options.limit !== null && (!Number.isInteger(options.limit) || options.limit < 1)) {
    throw new Error('limit must be a positive integer');
  }

  if (!options.symbols.length) {
    throw new Error('At least one symbol is required');
  }

  if (!options.ranges.length) {
    throw new Error('At least one date range is required');
  }

  if (!options.maxUnits.length) {
    throw new Error('At least one maxUnits value is required');
  }

  return options;
};

function parseBoolean(value, label) {
  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'true') {
    return true;
  }

  if (normalized === 'false') {
    return false;
  }

  throw new Error(`${label} must be true or false`);
}

function parsePositiveIntegerList(value, label) {
  const values = String(value).split(',').map((item) => item.trim()).filter(Boolean);
  if (!values.length) {
    throw new Error(`${label} must include at least one positive integer`);
  }

  return values.map((item) => {
    const parsed = Number(item);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new Error(`${label} must include only positive integers`);
    }

    return parsed;
  });
}

const buildCombinations = ({ symbols, ranges, maxUnits, limit }) => {
  const combinations = [];
  symbols.forEach((symbol) => {
    ranges.forEach((range) => {
      maxUnits.forEach((units) => {
        combinations.push({ symbol, ...range, maxUnits: units });
      });
    });
  });

  return limit ? combinations.slice(0, limit) : combinations;
};

const formatDateForFile = (date) => date.toISOString().replace(/[:.]/g, '-');

const getDefaultOutputPath = () => {
  const filename = `matrix-results-${formatDateForFile(new Date())}.csv`;
  return path.join(process.cwd(), 'reports', filename);
};

const round = (value, digits = 2) => {
  if (!Number.isFinite(value)) {
    return '';
  }

  return Number(value.toFixed(digits));
};

const countTrades = (trades, predicate) => trades.filter(predicate).length;

const sumTrades = (trades, selector) => trades.reduce((sum, trade) => sum + selector(trade), 0);

const average = (values) => {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const median = (values) => {
  if (!values.length) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);
  if (sorted.length % 2) {
    return sorted[midpoint];
  }

  return (sorted[midpoint - 1] + sorted[midpoint]) / 2;
};

const standardDeviation = (values) => {
  if (values.length < 2) {
    return 0;
  }

  const mean = average(values);
  const variance = values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
};

const yearsBetween = (from, to) => {
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  const years = (end - start) / msPerYear;
  return Number.isFinite(years) && years > 0 ? years : 0;
};

const calculateEquityReturns = (equityCurve) => {
  const returns = [];
  for (let index = 1; index < equityCurve.length; index += 1) {
    const previous = equityCurve[index - 1].equity;
    const current = equityCurve[index].equity;
    if (previous > 0) {
      returns.push((current - previous) / previous);
    }
  }

  return returns;
};

const calculateRiskStats = ({ result, firstBar, lastBar, initialCapital }) => {
  const totalReturn = (result.finalEquity - initialCapital) / initialCapital;
  const years = yearsBetween(firstBar, lastBar);
  const cagr = years > 0 && result.finalEquity > 0
    ? ((result.finalEquity / initialCapital) ** (1 / years)) - 1
    : 0;
  const equityReturns = calculateEquityReturns(result.equityCurve);
  const dailyVolatility = standardDeviation(equityReturns);
  const annualizedVolatility = dailyVolatility * Math.sqrt(252);
  const averageDailyReturn = average(equityReturns);
  const downsideReturns = equityReturns.filter((value) => value < 0);
  const downsideDeviation = standardDeviation(downsideReturns);

  return {
    totalReturnPct: totalReturn * 100,
    returnToMaxDrawdown: result.maxDrawdown > 0 ? (totalReturn * 100) / result.maxDrawdown : 0,
    cagrPct: cagr * 100,
    equityVolatilityPct: annualizedVolatility * 100,
    sharpe: dailyVolatility > 0 ? (averageDailyReturn / dailyVolatility) * Math.sqrt(252) : 0,
    sortino: downsideDeviation > 0 ? (averageDailyReturn / downsideDeviation) * Math.sqrt(252) : 0,
  };
};

const summarizeSide = (exits, direction) => {
  const sideTrades = exits.filter((trade) => trade.direction === direction);
  const sidePnl = sumTrades(sideTrades, (trade) => trade.pnl);
  const wins = sideTrades.filter((trade) => trade.pnl > 0).length;

  return {
    trades: sideTrades.length,
    pnl: sidePnl,
    winRate: sideTrades.length ? (wins / sideTrades.length) * 100 : 0,
    averageTrade: sideTrades.length ? sidePnl / sideTrades.length : 0,
  };
};

const summarizeTradeQuality = (exits) => {
  const wins = exits.filter((trade) => trade.pnl > 0);
  const losses = exits.filter((trade) => trade.pnl < 0);
  const grossProfit = sumTrades(wins, (trade) => trade.pnl);
  const grossLoss = Math.abs(sumTrades(losses, (trade) => trade.pnl));
  const largestWin = wins.length ? Math.max(...wins.map((trade) => trade.pnl)) : 0;
  const netPnl = grossProfit - grossLoss;

  return {
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : 0,
    averageWin: wins.length ? grossProfit / wins.length : 0,
    averageLoss: losses.length ? sumTrades(losses, (trade) => trade.pnl) / losses.length : 0,
    medianTradePnl: median(exits.map((trade) => trade.pnl)),
    largestWin,
    largestWinPctOfGrossProfit: grossProfit > 0 ? (largestWin / grossProfit) * 100 : 0,
    largestWinPctOfNetPnl: netPnl > 0 ? (largestWin / netPnl) * 100 : 0,
    baseUnitPnl: sumTrades(exits, (trade) => trade.basePnl || 0),
    addedUnitPnl: sumTrades(exits, (trade) => trade.addPnl || 0),
  };
};

const summarizeResult = ({ combo, prices, result, initialCapital, riskPercent, allowShort }) => {
  const exits = result.trades.filter((trade) => trade.type === 'Exit');
  const totalPnl = exits.reduce((sum, trade) => sum + trade.pnl, 0);
  const firstBar = prices.length ? prices[0].date : '';
  const lastBar = prices.length ? prices[prices.length - 1].date : '';
  const riskStats = calculateRiskStats({
    result,
    firstBar,
    lastBar,
    initialCapital,
  });
  const long = summarizeSide(exits, 'long');
  const short = summarizeSide(exits, 'short');
  const tradeQuality = summarizeTradeQuality(exits);

  return {
    symbol: combo.symbol,
    from: combo.from,
    to: combo.to,
    bars: prices.length,
    firstBar,
    lastBar,
    initialCapital,
    riskPercent,
    allowShort,
    maxUnits: combo.maxUnits,
    finalEquity: round(result.finalEquity),
    totalReturnPct: round(riskStats.totalReturnPct),
    maxDrawdownPct: round(result.maxDrawdown),
    returnToMaxDrawdown: round(riskStats.returnToMaxDrawdown, 3),
    cagrPct: round(riskStats.cagrPct),
    equityVolatilityPct: round(riskStats.equityVolatilityPct),
    sharpe: round(riskStats.sharpe, 3),
    sortino: round(riskStats.sortino, 3),
    totalTrades: result.totalTrades,
    entries: result.entries,
    longEntries: countTrades(result.trades, (trade) => trade.type === 'Entry' && trade.direction === 'long'),
    shortEntries: countTrades(result.trades, (trade) => trade.type === 'Entry' && trade.direction === 'short'),
    longTrades: long.trades,
    shortTrades: short.trades,
    longPnl: round(long.pnl),
    shortPnl: round(short.pnl),
    longWinRatePct: round(long.winRate),
    shortWinRatePct: round(short.winRate),
    longAvgTrade: round(long.averageTrade),
    shortAvgTrade: round(short.averageTrade),
    addedUnits: result.addedUnits,
    winningTrades: result.winningTrades,
    losingTrades: Math.max(0, result.totalTrades - result.winningTrades),
    winRatePct: round(result.winRate),
    profitFactor: round(tradeQuality.profitFactor, 3),
    averageWin: round(tradeQuality.averageWin),
    averageLoss: round(tradeQuality.averageLoss),
    medianTradePnl: round(tradeQuality.medianTradePnl),
    largestWin: round(tradeQuality.largestWin),
    largestWinPctOfGrossProfit: round(tradeQuality.largestWinPctOfGrossProfit),
    largestWinPctOfNetPnl: round(tradeQuality.largestWinPctOfNetPnl),
    baseUnitPnl: round(tradeQuality.baseUnitPnl),
    addedUnitPnl: round(tradeQuality.addedUnitPnl),
    stopExits: countTrades(exits, (trade) => trade.reason === 'stop'),
    channelExits: countTrades(exits, (trade) => trade.reason === 'channel'),
    endOfDataExits: countTrades(exits, (trade) => trade.reason === 'end-of-data'),
    totalPnl: round(totalPnl),
    error: '',
  };
};

const summarizeError = ({ combo, initialCapital, riskPercent, allowShort, error }) => ({
  symbol: combo.symbol,
  from: combo.from,
  to: combo.to,
  bars: '',
  firstBar: '',
  lastBar: '',
  initialCapital,
  riskPercent,
  allowShort,
  maxUnits: combo.maxUnits,
  finalEquity: '',
  totalReturnPct: '',
  maxDrawdownPct: '',
  totalTrades: '',
  entries: '',
  longEntries: '',
  shortEntries: '',
  addedUnits: '',
  winningTrades: '',
  losingTrades: '',
  winRatePct: '',
  stopExits: '',
  channelExits: '',
  endOfDataExits: '',
  totalPnl: '',
  error: error.message,
});

const escapeCsvValue = (value) => {
  const text = value === null || value === undefined ? '' : String(value);
  if (!/[",\n\r]/.test(text)) {
    return text;
  }

  return `"${text.replace(/"/g, '""')}"`;
};

const toCsv = (rows) => {
  const lines = [csvColumns.join(',')];
  rows.forEach((row) => {
    lines.push(csvColumns.map((column) => escapeCsvValue(row[column])).join(','));
  });
  return `${lines.join('\n')}\n`;
};

const runCombo = async ({ combo, initialCapital, riskPercent, allowShort }) => {
  const prices = await dataProvider.getHistoricalPrices({
    symbol: combo.symbol,
    from: combo.from,
    to: combo.to,
    interval: '1d',
  });
  const filtered = prices.filter((bar) => bar.date >= combo.from && bar.date <= combo.to);

  if (filtered.length < 40) {
    throw new Error('Not enough historical data for the requested date range');
  }

  const result = turtleStrategy.simulateTurtleTrading({
    prices: filtered,
    initialCapital,
    riskPercent,
    allowShort,
    maxUnits: combo.maxUnits,
  });

  return summarizeResult({
    combo,
    prices: filtered,
    result,
    initialCapital,
    riskPercent,
    allowShort,
  });
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printUsage();
    return;
  }

  const output = options.output || getDefaultOutputPath();
  const combinations = buildCombinations(options);

  if (options.dryRun) {
    combinations.forEach((combo, index) => {
      console.log(`${index + 1}. ${combo.symbol} ${combo.from} to ${combo.to} maxUnits=${combo.maxUnits}`);
    });
    console.log(`Planned ${combinations.length} combinations.`);
    return;
  }

  const rows = [];
  for (const [index, combo] of combinations.entries()) {
    const label = `${combo.symbol} ${combo.from} to ${combo.to} maxUnits=${combo.maxUnits}`;
    process.stdout.write(`[${index + 1}/${combinations.length}] ${label} ... `);

    try {
      const row = await runCombo({
        combo,
        initialCapital: options.initialCapital,
        riskPercent: options.riskPercent,
        allowShort: options.allowShort,
      });
      rows.push(row);
      process.stdout.write('ok\n');
    } catch (error) {
      rows.push(summarizeError({
        combo,
        initialCapital: options.initialCapital,
        riskPercent: options.riskPercent,
        allowShort: options.allowShort,
        error,
      }));
      process.stdout.write(`error: ${error.message}\n`);
    }
  }

  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, toCsv(rows), 'utf8');
  console.log(`Wrote ${rows.length} rows to ${output}`);
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
