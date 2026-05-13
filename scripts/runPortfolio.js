#!/usr/bin/env node
'use strict';

const fs = require('fs/promises');
const path = require('path');
const dotenv = require('dotenv');

const dataProvider = require('../lib/dataProvider');
const portfolioStrategy = require('../lib/portfolioStrategy');

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
  'from',
  'to',
  'symbolCount',
  'symbols',
  'initialCapital',
  'riskPercent',
  'allowShort',
  'entryPeriod',
  'exitPeriod',
  'atrPeriod',
  'maxUnits',
  'maxOpenPositions',
  'slippageBps',
  'finalEquity',
  'totalReturnPct',
  'maxDrawdownPct',
  'returnToMaxDrawdown',
  'cagrPct',
  'equityVolatilityPct',
  'sharpe',
  'sortino',
  'averageExposurePct',
  'maxOpenPositionsObserved',
  'totalTrades',
  'entries',
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

const tradeCsvColumns = [
  'from',
  'to',
  'date',
  'symbol',
  'type',
  'reason',
  'direction',
  'unitNumber',
  'units',
  'shares',
  'entryDate',
  'entryPrice',
  'triggerPrice',
  'slippageBps',
  'exitDate',
  'exitPrice',
  'cost',
  'proceeds',
  'pnl',
  'basePnl',
  'addedUnitPnl',
  'cashAfter',
  'equityAfter',
  'openPositionsAfter',
];

const equityCsvColumns = [
  'from',
  'to',
  'slippageBps',
  'date',
  'equity',
  'cash',
  'exposurePct',
  'openPositions',
];

const printUsage = () => {
  console.log(`
Usage:
  node scripts/runPortfolio.js [options]

Options:
  --output=PATH                  CSV output path
  --symbols=AAPL,MSFT,SPY        Comma-separated symbols
  --ranges=FROM:TO,FROM:TO       Comma-separated date ranges
  --initialCapital=100000        Starting capital
  --riskPercent=1                Risk percent per unit
  --entryPeriod=20               Entry channel period
  --exitPeriod=10                Exit channel period
  --atrPeriod=20                 Turtle N period
  --maxUnits=4                   Max units per symbol
  --maxOpenPositions=10          Max concurrent symbols
  --slippageBps=0                Fill slippage in bps; comma-separated values run a sweep
  --tradesOutput=PATH            Optional trade log CSV output path
  --equityOutput=PATH            Optional daily equity/exposure CSV output path
  --dry-run                      Print planned portfolio runs without fetching data
  --help                         Show this help

Examples:
  node scripts/runPortfolio.js --dry-run
  node scripts/runPortfolio.js --symbols=AAPL,MSFT,NVDA --ranges=2020-01-01:2024-12-31
`);
};

const parseArgs = (argv) => {
  const options = {
    symbols: defaultSymbols,
    ranges: defaultRanges,
    initialCapital: Number(process.env.STARTING_CAPITAL) || 100000,
    riskPercent: Number(process.env.RISK_PERCENT) || 1,
    allowShort: false,
    entryPeriod: Number(process.env.ENTRY_PERIOD) || 20,
    exitPeriod: Number(process.env.EXIT_PERIOD) || 10,
    atrPeriod: Number(process.env.ATR_PERIOD) || 20,
    maxUnits: Number(process.env.MAX_UNITS) || 4,
    maxOpenPositions: Number(process.env.MAX_OPEN_POSITIONS) || 10,
    slippageBps: parseNonNegativeNumberList(process.env.SLIPPAGE_BPS || '0', 'SLIPPAGE_BPS'),
    output: null,
    tradesOutput: null,
    equityOutput: null,
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
    } else if (key === '--tradesOutput') {
      options.tradesOutput = value;
    } else if (key === '--equityOutput') {
      options.equityOutput = value;
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
    } else if (key === '--entryPeriod') {
      options.entryPeriod = Number(value);
    } else if (key === '--exitPeriod') {
      options.exitPeriod = Number(value);
    } else if (key === '--atrPeriod') {
      options.atrPeriod = Number(value);
    } else if (key === '--maxUnits') {
      options.maxUnits = Number(value);
    } else if (key === '--maxOpenPositions') {
      options.maxOpenPositions = Number(value);
    } else if (key === '--slippageBps') {
      options.slippageBps = parseNonNegativeNumberList(value, 'slippageBps');
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

  ['entryPeriod', 'exitPeriod', 'atrPeriod', 'maxUnits', 'maxOpenPositions'].forEach((key) => {
    if (!Number.isInteger(options[key]) || options[key] < 1) {
      throw new Error(`${key} must be a positive integer`);
    }
  });

  if (options.exitPeriod >= options.entryPeriod) {
    throw new Error('exitPeriod must be less than entryPeriod');
  }

  if (!options.symbols.length) {
    throw new Error('At least one symbol is required');
  }

  if (!options.ranges.length) {
    throw new Error('At least one date range is required');
  }

  if (!options.slippageBps.length) {
    throw new Error('At least one slippageBps value is required');
  }

  return options;
};

function parseNonNegativeNumberList(value, label) {
  const values = String(value).split(',').map((item) => item.trim()).filter(Boolean);
  if (!values.length) {
    throw new Error(`${label} must include at least one non-negative number`);
  }

  return values.map((item) => {
    const parsed = Number(item);
    if (!Number.isFinite(parsed) || parsed < 0) {
      throw new Error(`${label} must include only non-negative numbers`);
    }

    return parsed;
  });
}

const formatDateForFile = (date) => date.toISOString().replace(/[:.]/g, '-');

const getDefaultOutputPath = () => {
  const filename = `portfolio-results-${formatDateForFile(new Date())}.csv`;
  return path.join(process.cwd(), 'reports', filename);
};

const round = (value, digits = 2) => {
  if (!Number.isFinite(value)) {
    return '';
  }

  return Number(value.toFixed(digits));
};

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

const summarizeTrades = (exits) => {
  const wins = exits.filter((trade) => trade.pnl > 0);
  const losses = exits.filter((trade) => trade.pnl < 0);
  const grossProfit = wins.reduce((sum, trade) => sum + trade.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((sum, trade) => sum + trade.pnl, 0));
  const largestWin = wins.length ? Math.max(...wins.map((trade) => trade.pnl)) : 0;
  const netPnl = grossProfit - grossLoss;

  return {
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : 0,
    averageWin: wins.length ? grossProfit / wins.length : 0,
    averageLoss: losses.length ? losses.reduce((sum, trade) => sum + trade.pnl, 0) / losses.length : 0,
    medianTradePnl: median(exits.map((trade) => trade.pnl)),
    largestWin,
    largestWinPctOfGrossProfit: grossProfit > 0 ? (largestWin / grossProfit) * 100 : 0,
    largestWinPctOfNetPnl: netPnl > 0 ? (largestWin / netPnl) * 100 : 0,
    baseUnitPnl: exits.reduce((sum, trade) => sum + (trade.basePnl || 0), 0),
    addedUnitPnl: exits.reduce((sum, trade) => sum + (trade.addPnl || 0), 0),
  };
};

const summarizeResult = ({ range, symbols, options, result }) => {
  const totalReturn = ((result.finalEquity - options.initialCapital) / options.initialCapital) * 100;
  const years = yearsBetween(range.from, range.to);
  const cagr = years > 0 && result.finalEquity > 0
    ? ((result.finalEquity / options.initialCapital) ** (1 / years) - 1) * 100
    : 0;
  const equityReturns = calculateEquityReturns(result.equityCurve);
  const dailyVolatility = standardDeviation(equityReturns);
  const downsideDeviation = standardDeviation(equityReturns.filter((value) => value < 0));
  const exits = result.trades.filter((trade) => trade.type === 'Exit');
  const tradeQuality = summarizeTrades(exits);
  const totalPnl = exits.reduce((sum, trade) => sum + trade.pnl, 0);

  return {
    from: range.from,
    to: range.to,
    symbolCount: symbols.length,
    symbols: symbols.join(' '),
    initialCapital: options.initialCapital,
    riskPercent: options.riskPercent,
    allowShort: options.allowShort,
    entryPeriod: options.entryPeriod,
    exitPeriod: options.exitPeriod,
    atrPeriod: options.atrPeriod,
    maxUnits: options.maxUnits,
    maxOpenPositions: options.maxOpenPositions,
    slippageBps: options.slippageBps,
    finalEquity: round(result.finalEquity),
    totalReturnPct: round(totalReturn),
    maxDrawdownPct: round(result.maxDrawdown),
    returnToMaxDrawdown: round(result.maxDrawdown > 0 ? totalReturn / result.maxDrawdown : 0, 3),
    cagrPct: round(cagr),
    equityVolatilityPct: round(dailyVolatility * Math.sqrt(252) * 100),
    sharpe: round(dailyVolatility > 0 ? (average(equityReturns) / dailyVolatility) * Math.sqrt(252) : 0, 3),
    sortino: round(downsideDeviation > 0 ? (average(equityReturns) / downsideDeviation) * Math.sqrt(252) : 0, 3),
    averageExposurePct: round(result.averageExposurePct),
    maxOpenPositionsObserved: result.maxOpenPositionsObserved,
    totalTrades: result.totalTrades,
    entries: result.entries,
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
    stopExits: exits.filter((trade) => trade.reason === 'stop').length,
    channelExits: exits.filter((trade) => trade.reason === 'channel').length,
    endOfDataExits: exits.filter((trade) => trade.reason === 'end-of-data').length,
    totalPnl: round(totalPnl),
    error: '',
  };
};

const summarizeError = ({ range, symbols, options, error }) => ({
  from: range.from,
  to: range.to,
  symbolCount: symbols.length,
  symbols: symbols.join(' '),
  initialCapital: options.initialCapital,
  riskPercent: options.riskPercent,
  allowShort: options.allowShort,
  entryPeriod: options.entryPeriod,
  exitPeriod: options.exitPeriod,
  atrPeriod: options.atrPeriod,
  maxUnits: options.maxUnits,
  maxOpenPositions: options.maxOpenPositions,
  slippageBps: options.slippageBps,
  finalEquity: '',
  totalReturnPct: '',
  maxDrawdownPct: '',
  returnToMaxDrawdown: '',
  cagrPct: '',
  equityVolatilityPct: '',
  sharpe: '',
  sortino: '',
  averageExposurePct: '',
  maxOpenPositionsObserved: '',
  totalTrades: '',
  entries: '',
  addedUnits: '',
  winningTrades: '',
  losingTrades: '',
  winRatePct: '',
  profitFactor: '',
  averageWin: '',
  averageLoss: '',
  medianTradePnl: '',
  largestWin: '',
  largestWinPctOfGrossProfit: '',
  largestWinPctOfNetPnl: '',
  baseUnitPnl: '',
  addedUnitPnl: '',
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

const rowsToCsv = ({ columns, rows }) => {
  const lines = [columns.join(',')];
  rows.forEach((row) => {
    lines.push(columns.map((column) => escapeCsvValue(row[column])).join(','));
  });
  return `${lines.join('\n')}\n`;
};

const tradeDate = (trade) => trade.exitDate || trade.entryDate;

const buildTradeRows = ({ range, options, trades }) => trades.map((trade) => ({
  from: range.from,
  to: range.to,
  date: tradeDate(trade),
  symbol: trade.symbol,
  type: trade.type,
  reason: trade.reason || '',
  direction: trade.direction,
  unitNumber: trade.unitNumber || '',
  units: trade.units || '',
  shares: trade.shares,
  entryDate: trade.entryDate || '',
  entryPrice: round(trade.entryPrice),
  triggerPrice: round(trade.triggerPrice),
  slippageBps: trade.slippageBps ?? options.slippageBps,
  exitDate: trade.exitDate || '',
  exitPrice: round(trade.exitPrice),
  cost: round(trade.cost),
  proceeds: round(trade.proceeds),
  pnl: round(trade.pnl),
  basePnl: round(trade.basePnl),
  addedUnitPnl: round(trade.addPnl),
  cashAfter: round(trade.cashAfter),
  equityAfter: round(trade.equityAfter),
  openPositionsAfter: trade.openPositionsAfter,
}));

const buildEquityRows = ({ range, options, result }) => result.equityCurve.map((point, index) => {
  const exposure = result.exposureCurve[index] || {};
  return {
    from: range.from,
    to: range.to,
    slippageBps: options.slippageBps,
    date: point.date,
    equity: round(point.equity),
    cash: round(point.cash),
    exposurePct: round(exposure.exposurePct),
    openPositions: point.openPositions,
  };
});

const loadPriceBySymbol = async ({ symbols, range }) => {
  const entries = [];
  for (const symbol of symbols) {
    const prices = await dataProvider.getHistoricalPrices({
      symbol,
      from: range.from,
      to: range.to,
      interval: '1d',
    });
    entries.push([
      symbol,
      prices.filter((bar) => bar.date >= range.from && bar.date <= range.to),
    ]);
  }

  return Object.fromEntries(entries);
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printUsage();
    return;
  }

  if (options.dryRun) {
    let index = 1;
    options.ranges.forEach((range) => {
      options.slippageBps.forEach((slippageBps) => {
        console.log(`${index}. ${range.from} to ${range.to} symbols=${options.symbols.length} slippageBps=${slippageBps}`);
        index += 1;
      });
    });
    console.log(`Planned ${options.ranges.length * options.slippageBps.length} portfolio runs.`);
    return;
  }

  const rows = [];
  const tradeRows = [];
  const equityRows = [];
  const combinations = [];
  options.ranges.forEach((range) => {
    options.slippageBps.forEach((slippageBps) => {
      combinations.push({ range, slippageBps });
    });
  });

  for (const [index, combo] of combinations.entries()) {
    const { range, slippageBps } = combo;
    const runOptions = {
      ...options,
      slippageBps,
    };
    const label = `${range.from} to ${range.to} symbols=${options.symbols.length} slippageBps=${slippageBps}`;
    process.stdout.write(`[${index + 1}/${combinations.length}] ${label} ... `);

    try {
      const priceBySymbol = await loadPriceBySymbol({
        symbols: options.symbols,
        range,
      });
      const result = portfolioStrategy.simulatePortfolioTrading({
        priceBySymbol,
        initialCapital: options.initialCapital,
        riskPercent: options.riskPercent,
        allowShort: options.allowShort,
        entryPeriod: options.entryPeriod,
        exitPeriod: options.exitPeriod,
        atrPeriod: options.atrPeriod,
        maxUnits: options.maxUnits,
        maxOpenPositions: options.maxOpenPositions,
        slippageBps,
      });
      rows.push(summarizeResult({
        range,
        symbols: options.symbols,
        options: runOptions,
        result,
      }));
      tradeRows.push(...buildTradeRows({
        range,
        options: runOptions,
        trades: result.trades,
      }));
      equityRows.push(...buildEquityRows({
        range,
        options: runOptions,
        result,
      }));
      process.stdout.write('ok\n');
    } catch (error) {
      rows.push(summarizeError({
        range,
        symbols: options.symbols,
        options: runOptions,
        error,
      }));
      process.stdout.write(`error: ${error.message}\n`);
    }
  }

  const output = options.output || getDefaultOutputPath();
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, toCsv(rows), 'utf8');
  console.log(`Wrote ${rows.length} rows to ${output}`);

  if (options.tradesOutput) {
    await fs.mkdir(path.dirname(options.tradesOutput), { recursive: true });
    await fs.writeFile(options.tradesOutput, rowsToCsv({
      columns: tradeCsvColumns,
      rows: tradeRows,
    }), 'utf8');
    console.log(`Wrote ${tradeRows.length} trade rows to ${options.tradesOutput}`);
  }

  if (options.equityOutput) {
    await fs.mkdir(path.dirname(options.equityOutput), { recursive: true });
    await fs.writeFile(options.equityOutput, rowsToCsv({
      columns: equityCsvColumns,
      rows: equityRows,
    }), 'utf8');
    console.log(`Wrote ${equityRows.length} equity rows to ${options.equityOutput}`);
  }
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
