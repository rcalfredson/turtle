#!/usr/bin/env node
'use strict';

const fs = require('fs/promises');
const path = require('path');
const dotenv = require('dotenv');

const benchmarkStrategy = require('../lib/benchmarkStrategy');
const dataProvider = require('../lib/dataProvider');

dotenv.config();

const defaultSymbols = [
  'AAPL', 'MSFT', 'NVDA', 'AMZN', 'META', 'GOOGL',
  'JPM', 'XOM', 'UNH', 'COST', 'LLY', 'CAT',
  'SPY', 'QQQ', 'IWM', 'DIA', 'XLE', 'XLK',
];

const defaultBenchmarkSymbols = ['SPY', 'QQQ', 'IWM', 'DIA'];

const defaultRanges = [
  { from: '2020-01-01', to: '2024-12-31' },
  { from: '2021-01-01', to: '2023-12-31' },
  { from: '2022-01-01', to: '2024-12-31' },
  { from: '2023-01-01', to: '2026-05-01' },
];

const csvColumns = [
  'from',
  'to',
  'benchmarkType',
  'benchmarkName',
  'symbolCount',
  'symbols',
  'startDate',
  'endDate',
  'initialCapital',
  'finalEquity',
  'totalReturnPct',
  'maxDrawdownPct',
  'returnToMaxDrawdown',
  'cagrPct',
  'equityVolatilityPct',
  'sharpe',
  'sortino',
  'averageExposurePct',
  'error',
];

const equityCsvColumns = [
  'from',
  'to',
  'benchmarkType',
  'benchmarkName',
  'date',
  'equity',
  'cash',
  'exposurePct',
  'positions',
];

const printUsage = () => {
  console.log(`
Usage:
  node scripts/runBenchmarks.js [options]

Options:
  --output=PATH                  CSV output path
  --equityOutput=PATH            Optional daily benchmark equity CSV output path
  --symbols=AAPL,MSFT,SPY        Comma-separated same-universe symbols
  --benchmarkSymbols=SPY,QQQ     Comma-separated ETF/single-symbol benchmarks
  --ranges=FROM:TO,FROM:TO       Comma-separated date ranges
  --initialCapital=100000        Starting capital
  --dry-run                      Print planned benchmark runs without fetching data
  --help                         Show this help

Examples:
  node scripts/runBenchmarks.js --dry-run
  node scripts/runBenchmarks.js --benchmarkSymbols=SPY,QQQ,IWM,DIA
`);
};

const parseArgs = (argv) => {
  const options = {
    symbols: defaultSymbols,
    benchmarkSymbols: defaultBenchmarkSymbols,
    ranges: defaultRanges,
    initialCapital: Number(process.env.STARTING_CAPITAL) || 100000,
    output: null,
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
    } else if (key === '--equityOutput') {
      options.equityOutput = value;
    } else if (key === '--symbols') {
      options.symbols = parseSymbols(value);
    } else if (key === '--benchmarkSymbols') {
      options.benchmarkSymbols = parseSymbols(value);
    } else if (key === '--ranges') {
      options.ranges = parseRanges(value);
    } else if (key === '--initialCapital') {
      options.initialCapital = Number(value);
    } else {
      throw new Error(`Unknown option: ${key}`);
    }
  });

  if (!Number.isFinite(options.initialCapital) || options.initialCapital <= 0) {
    throw new Error('initialCapital must be a positive number');
  }

  if (!options.symbols.length) {
    throw new Error('At least one same-universe symbol is required');
  }

  if (!options.benchmarkSymbols.length) {
    throw new Error('At least one benchmark symbol is required');
  }

  if (!options.ranges.length) {
    throw new Error('At least one date range is required');
  }

  return options;
};

const parseSymbols = (value) => value.split(',').map((symbol) => symbol.trim().toUpperCase()).filter(Boolean);

const parseRanges = (value) => value.split(',').map((range) => {
  const [from, to] = range.split(':');
  if (!from || !to) {
    throw new Error(`Invalid range: ${range}`);
  }

  return { from, to };
});

const formatDateForFile = (date) => date.toISOString().replace(/[:.]/g, '-');

const getDefaultOutputPath = () => {
  const filename = `benchmark-results-${formatDateForFile(new Date())}.csv`;
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

const summarizeResult = ({ range, benchmarkType, benchmarkName, result }) => {
  const totalReturn = ((result.finalEquity - result.initialCapital) / result.initialCapital) * 100;
  const years = yearsBetween(range.from, range.to);
  const cagr = years > 0 && result.finalEquity > 0
    ? ((result.finalEquity / result.initialCapital) ** (1 / years) - 1) * 100
    : 0;
  const equityReturns = calculateEquityReturns(result.equityCurve);
  const dailyVolatility = standardDeviation(equityReturns);
  const downsideDeviation = standardDeviation(equityReturns.filter((value) => value < 0));

  return {
    from: range.from,
    to: range.to,
    benchmarkType,
    benchmarkName,
    symbolCount: result.symbols.length,
    symbols: result.symbols.join(' '),
    startDate: result.startDate,
    endDate: result.endDate,
    initialCapital: result.initialCapital,
    finalEquity: round(result.finalEquity),
    totalReturnPct: round(totalReturn),
    maxDrawdownPct: round(result.maxDrawdown),
    returnToMaxDrawdown: round(result.maxDrawdown > 0 ? totalReturn / result.maxDrawdown : 0, 3),
    cagrPct: round(cagr),
    equityVolatilityPct: round(dailyVolatility * Math.sqrt(252) * 100),
    sharpe: round(dailyVolatility > 0 ? (average(equityReturns) / dailyVolatility) * Math.sqrt(252) : 0, 3),
    sortino: round(downsideDeviation > 0 ? (average(equityReturns) / downsideDeviation) * Math.sqrt(252) : 0, 3),
    averageExposurePct: round(result.averageExposurePct),
    error: '',
  };
};

const summarizeError = ({ range, benchmarkType, benchmarkName, symbols, initialCapital, error }) => ({
  from: range.from,
  to: range.to,
  benchmarkType,
  benchmarkName,
  symbolCount: symbols.length,
  symbols: symbols.join(' '),
  startDate: '',
  endDate: '',
  initialCapital,
  finalEquity: '',
  totalReturnPct: '',
  maxDrawdownPct: '',
  returnToMaxDrawdown: '',
  cagrPct: '',
  equityVolatilityPct: '',
  sharpe: '',
  sortino: '',
  averageExposurePct: '',
  error: error.message,
});

const escapeCsvValue = (value) => {
  const text = value === null || value === undefined ? '' : String(value);
  if (!/[",\n\r]/.test(text)) {
    return text;
  }

  return `"${text.replace(/"/g, '""')}"`;
};

const rowsToCsv = ({ columns, rows }) => {
  const lines = [columns.join(',')];
  rows.forEach((row) => {
    lines.push(columns.map((column) => escapeCsvValue(row[column])).join(','));
  });
  return `${lines.join('\n')}\n`;
};

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

const buildEquityRows = ({ range, benchmarkType, benchmarkName, result }) => result.equityCurve.map((point) => ({
  from: range.from,
  to: range.to,
  benchmarkType,
  benchmarkName,
  date: point.date,
  equity: round(point.equity),
  cash: round(point.cash),
  exposurePct: round(point.exposurePct),
  positions: point.positions,
}));

const buildBenchmarkRuns = (options) => {
  const runs = [];
  options.ranges.forEach((range) => {
    runs.push({
      range,
      benchmarkType: 'same-universe',
      benchmarkName: 'equal-weight',
      symbols: options.symbols,
    });

    options.benchmarkSymbols.forEach((symbol) => {
      runs.push({
        range,
        benchmarkType: 'etf',
        benchmarkName: symbol,
        symbols: [symbol],
      });
    });
  });

  return runs;
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printUsage();
    return;
  }

  const runs = buildBenchmarkRuns(options);
  if (options.dryRun) {
    runs.forEach((run, index) => {
      console.log(`${index + 1}. ${run.range.from} to ${run.range.to} ${run.benchmarkType}:${run.benchmarkName} symbols=${run.symbols.join(' ')}`);
    });
    console.log(`Planned ${runs.length} benchmark runs.`);
    return;
  }

  const rows = [];
  const equityRows = [];

  for (const [index, run] of runs.entries()) {
    const label = `${run.range.from} to ${run.range.to} ${run.benchmarkType}:${run.benchmarkName}`;
    process.stdout.write(`[${index + 1}/${runs.length}] ${label} ... `);

    try {
      const priceBySymbol = await loadPriceBySymbol({
        symbols: run.symbols,
        range: run.range,
      });
      const result = benchmarkStrategy.simulateBuyAndHold({
        priceBySymbol,
        initialCapital: options.initialCapital,
      });
      rows.push(summarizeResult({
        range: run.range,
        benchmarkType: run.benchmarkType,
        benchmarkName: run.benchmarkName,
        result,
      }));
      equityRows.push(...buildEquityRows({
        range: run.range,
        benchmarkType: run.benchmarkType,
        benchmarkName: run.benchmarkName,
        result,
      }));
      process.stdout.write('ok\n');
    } catch (error) {
      rows.push(summarizeError({
        range: run.range,
        benchmarkType: run.benchmarkType,
        benchmarkName: run.benchmarkName,
        symbols: run.symbols,
        initialCapital: options.initialCapital,
        error,
      }));
      process.stdout.write(`error: ${error.message}\n`);
    }
  }

  const output = options.output || getDefaultOutputPath();
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, rowsToCsv({
    columns: csvColumns,
    rows,
  }), 'utf8');
  console.log(`Wrote ${rows.length} rows to ${output}`);

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
