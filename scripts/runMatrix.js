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
  'finalEquity',
  'totalReturnPct',
  'maxDrawdownPct',
  'totalTrades',
  'entries',
  'longEntries',
  'shortEntries',
  'addedUnits',
  'winningTrades',
  'losingTrades',
  'winRatePct',
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

  return options;
};

const buildCombinations = ({ symbols, ranges, limit }) => {
  const combinations = [];
  symbols.forEach((symbol) => {
    ranges.forEach((range) => {
      combinations.push({ symbol, ...range });
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

const summarizeResult = ({ combo, prices, result, initialCapital, riskPercent }) => {
  const exits = result.trades.filter((trade) => trade.type === 'Exit');
  const totalPnl = exits.reduce((sum, trade) => sum + trade.pnl, 0);

  return {
    symbol: combo.symbol,
    from: combo.from,
    to: combo.to,
    bars: prices.length,
    firstBar: prices.length ? prices[0].date : '',
    lastBar: prices.length ? prices[prices.length - 1].date : '',
    initialCapital,
    riskPercent,
    finalEquity: round(result.finalEquity),
    totalReturnPct: round(((result.finalEquity - initialCapital) / initialCapital) * 100),
    maxDrawdownPct: round(result.maxDrawdown),
    totalTrades: result.totalTrades,
    entries: result.entries,
    longEntries: countTrades(result.trades, (trade) => trade.type === 'Entry' && trade.direction === 'long'),
    shortEntries: countTrades(result.trades, (trade) => trade.type === 'Entry' && trade.direction === 'short'),
    addedUnits: result.addedUnits,
    winningTrades: result.winningTrades,
    losingTrades: Math.max(0, result.totalTrades - result.winningTrades),
    winRatePct: round(result.winRate),
    stopExits: countTrades(exits, (trade) => trade.reason === 'stop'),
    channelExits: countTrades(exits, (trade) => trade.reason === 'channel'),
    endOfDataExits: countTrades(exits, (trade) => trade.reason === 'end-of-data'),
    totalPnl: round(totalPnl),
    error: '',
  };
};

const summarizeError = ({ combo, initialCapital, riskPercent, error }) => ({
  symbol: combo.symbol,
  from: combo.from,
  to: combo.to,
  bars: '',
  firstBar: '',
  lastBar: '',
  initialCapital,
  riskPercent,
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

const runCombo = async ({ combo, initialCapital, riskPercent }) => {
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
  });

  return summarizeResult({
    combo,
    prices: filtered,
    result,
    initialCapital,
    riskPercent,
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
      console.log(`${index + 1}. ${combo.symbol} ${combo.from} to ${combo.to}`);
    });
    console.log(`Planned ${combinations.length} combinations.`);
    return;
  }

  const rows = [];
  for (const [index, combo] of combinations.entries()) {
    const label = `${combo.symbol} ${combo.from} to ${combo.to}`;
    process.stdout.write(`[${index + 1}/${combinations.length}] ${label} ... `);

    try {
      const row = await runCombo({
        combo,
        initialCapital: options.initialCapital,
        riskPercent: options.riskPercent,
      });
      rows.push(row);
      process.stdout.write('ok\n');
    } catch (error) {
      rows.push(summarizeError({
        combo,
        initialCapital: options.initialCapital,
        riskPercent: options.riskPercent,
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
