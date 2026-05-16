#!/usr/bin/env node
'use strict';

const fs = require('fs/promises');
const path = require('path');
const dotenv = require('dotenv');

const benchmarkStrategy = require('../lib/benchmarkStrategy');
const dataProvider = require('../lib/dataProvider');
const hybridStrategy = require('../lib/hybridStrategy');
const portfolioStrategy = require('../lib/portfolioStrategy');
const { loadSymbolsFile, parseSymbols } = require('../lib/symbols');

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
  'coreSymbol',
  'coreAllocationPct',
  'activeAllocationPct',
  'activeInitialCapital',
  'riskPercent',
  'allowShort',
  'entryPeriod',
  'exitPeriod',
  'atrPeriod',
  'maxUnits',
  'maxOpenPositions',
  'entryRank',
  'slippageBps',
  'maxVolumeParticipationPct',
  'gapAwareFills',
  'marketRegimeSymbol',
  'marketRegimeMa',
  'relativeStrengthSymbol',
  'relativeStrengthLookback',
  'startDate',
  'endDate',
  'finalEquity',
  'coreFinalEquity',
  'activeFinalEquity',
  'totalReturnPct',
  'maxDrawdownPct',
  'returnToMaxDrawdown',
  'cagrPct',
  'equityVolatilityPct',
  'sharpe',
  'sortino',
  'averageExposurePct',
  'activeTotalTrades',
  'activeEntries',
  'activeAddedUnits',
  'activeWinningTrades',
  'activeLosingTrades',
  'activeWinRatePct',
  'activeProfitFactor',
  'activeMarketRegimeBlockedEntries',
  'activeRelativeStrengthBlockedEntries',
  'error',
];

const equityCsvColumns = [
  'from',
  'to',
  'coreSymbol',
  'coreAllocationPct',
  'activeAllocationPct',
  'riskPercent',
  'entryPeriod',
  'exitPeriod',
  'maxUnits',
  'maxOpenPositions',
  'entryRank',
  'relativeStrengthSymbol',
  'relativeStrengthLookback',
  'date',
  'equity',
  'cash',
  'exposurePct',
  'coreEquity',
  'activeEquity',
  'coreCash',
  'activeCash',
  'coreExposurePct',
  'activeExposurePct',
  'positions',
  'activeOpenPositions',
];

const printUsage = () => {
  console.log(`
Usage:
  node scripts/runHybrid.js [options]

Options:
  --output=PATH                  CSV output path
  --equityOutput=PATH            Optional daily hybrid equity CSV output path
  --symbols=AAPL,MSFT,SPY        Comma-separated active sleeve symbols
  --symbolsFile=PATH             File containing active sleeve symbols separated by commas, whitespace, or newlines
  --ranges=FROM:TO,FROM:TO       Comma-separated date ranges
  --initialCapital=100000        Starting capital
  --coreSymbol=SPY               Passive buy-and-hold core symbol
  --activeAllocationPct=20       Active sleeve allocation percent; comma-separated values run a sweep
  --riskPercent=1                Active risk percent per unit; comma-separated values run a sweep
  --entryPeriod=20               Active entry channel period; comma-separated values run a sweep
  --exitPeriod=10                Active exit channel period; comma-separated values run a sweep
  --atrPeriod=20                 Active Turtle N period
  --maxUnits=4                   Active max units per symbol; comma-separated values run a sweep
  --maxOpenPositions=10          Active max concurrent symbols; comma-separated values run a sweep
  --entryRank=alphabetical       Active entry ordering; comma-separated values run a sweep. Options: alphabetical,momentum63,momentum126
  --slippageBps=0                Active fill slippage in bps; comma-separated values run a sweep
  --maxVolumeParticipationPct=1  Active max percent of daily volume per entry/add order; comma-separated values run a sweep
  --gapAwareFills=false          Active gap-aware fills; comma-separated booleans run a sweep
  --marketRegimeSymbol=SPY       Optional active market regime symbol used to gate entries/adds
  --marketRegimeMa=0             Active market regime SMA period; 0 disables, comma-separated values run a sweep
  --relativeStrengthSymbol=SPY   Optional benchmark symbol used to filter active entries
  --relativeStrengthLookback=0   Active relative-strength lookback; 0 disables, comma-separated values run a sweep
  --dry-run                      Print planned hybrid runs without fetching data
  --help                         Show this help

Examples:
  node scripts/runHybrid.js --dry-run
  node scripts/runHybrid.js --symbolsFile=universes/sp500-top100-established.txt --coreSymbol=SPY --activeAllocationPct=20,30
`);
};

const parseArgs = async (argv) => {
  const options = {
    symbols: defaultSymbols,
    symbolsFile: null,
    ranges: defaultRanges,
    initialCapital: Number(process.env.STARTING_CAPITAL) || 100000,
    coreSymbol: process.env.HYBRID_CORE_SYMBOL || 'SPY',
    activeAllocationPct: parsePositiveNumberList(process.env.HYBRID_ACTIVE_ALLOCATION_PCT || '20', 'HYBRID_ACTIVE_ALLOCATION_PCT'),
    riskPercent: parsePositiveNumberList(process.env.RISK_PERCENT || '1', 'RISK_PERCENT'),
    allowShort: false,
    entryPeriod: parsePositiveIntegerList(process.env.ENTRY_PERIOD || '20', 'ENTRY_PERIOD'),
    exitPeriod: parsePositiveIntegerList(process.env.EXIT_PERIOD || '10', 'EXIT_PERIOD'),
    atrPeriod: Number(process.env.ATR_PERIOD) || 20,
    maxUnits: parsePositiveIntegerList(process.env.MAX_UNITS || '4', 'MAX_UNITS'),
    maxOpenPositions: parsePositiveIntegerList(process.env.MAX_OPEN_POSITIONS || '10', 'MAX_OPEN_POSITIONS'),
    entryRank: parseEntryRankList(process.env.ENTRY_RANK || 'alphabetical'),
    slippageBps: parseNonNegativeNumberList(process.env.SLIPPAGE_BPS || '0', 'SLIPPAGE_BPS'),
    maxVolumeParticipationPct: parseNonNegativeNumberList(
      process.env.MAX_VOLUME_PARTICIPATION_PCT || '1',
      'MAX_VOLUME_PARTICIPATION_PCT',
    ),
    gapAwareFills: parseBooleanList(process.env.GAP_AWARE_FILLS || 'false', 'GAP_AWARE_FILLS'),
    marketRegimeSymbol: process.env.MARKET_REGIME_SYMBOL || '',
    marketRegimeMa: parseNonNegativeIntegerList(process.env.MARKET_REGIME_MA || '0', 'MARKET_REGIME_MA'),
    relativeStrengthSymbol: process.env.RELATIVE_STRENGTH_SYMBOL || '',
    relativeStrengthLookback: parseNonNegativeIntegerList(
      process.env.RELATIVE_STRENGTH_LOOKBACK || '0',
      'RELATIVE_STRENGTH_LOOKBACK',
    ),
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
    } else if (key === '--symbolsFile') {
      options.symbolsFile = value;
    } else if (key === '--ranges') {
      options.ranges = parseRanges(value);
    } else if (key === '--initialCapital') {
      options.initialCapital = Number(value);
    } else if (key === '--coreSymbol') {
      options.coreSymbol = value.trim().toUpperCase();
    } else if (key === '--activeAllocationPct') {
      options.activeAllocationPct = parsePositiveNumberList(value, 'activeAllocationPct');
    } else if (key === '--riskPercent') {
      options.riskPercent = parsePositiveNumberList(value, 'riskPercent');
    } else if (key === '--entryPeriod') {
      options.entryPeriod = parsePositiveIntegerList(value, 'entryPeriod');
    } else if (key === '--exitPeriod') {
      options.exitPeriod = parsePositiveIntegerList(value, 'exitPeriod');
    } else if (key === '--atrPeriod') {
      options.atrPeriod = Number(value);
    } else if (key === '--maxUnits') {
      options.maxUnits = parsePositiveIntegerList(value, 'maxUnits');
    } else if (key === '--maxOpenPositions') {
      options.maxOpenPositions = parsePositiveIntegerList(value, 'maxOpenPositions');
    } else if (key === '--entryRank') {
      options.entryRank = parseEntryRankList(value);
    } else if (key === '--slippageBps') {
      options.slippageBps = parseNonNegativeNumberList(value, 'slippageBps');
    } else if (key === '--maxVolumeParticipationPct') {
      options.maxVolumeParticipationPct = parseNonNegativeNumberList(value, 'maxVolumeParticipationPct');
    } else if (key === '--gapAwareFills') {
      options.gapAwareFills = parseBooleanList(value, 'gapAwareFills');
    } else if (key === '--marketRegimeSymbol') {
      options.marketRegimeSymbol = value.trim().toUpperCase();
    } else if (key === '--marketRegimeMa') {
      options.marketRegimeMa = parseNonNegativeIntegerList(value, 'marketRegimeMa');
    } else if (key === '--relativeStrengthSymbol') {
      options.relativeStrengthSymbol = value.trim().toUpperCase();
    } else if (key === '--relativeStrengthLookback') {
      options.relativeStrengthLookback = parseNonNegativeIntegerList(value, 'relativeStrengthLookback');
    } else {
      throw new Error(`Unknown option: ${key}`);
    }
  });

  if (options.symbolsFile && !options.help) {
    options.symbols = await loadSymbolsFile(options.symbolsFile);
  }

  validateOptions(options);
  return options;
};

const validateOptions = (options) => {
  if (!Number.isFinite(options.initialCapital) || options.initialCapital <= 0) {
    throw new Error('initialCapital must be a positive number');
  }

  if (!options.coreSymbol) {
    throw new Error('coreSymbol is required');
  }

  if (!options.symbols.length) {
    throw new Error('At least one active sleeve symbol is required');
  }

  if (!options.ranges.length) {
    throw new Error('At least one date range is required');
  }

  if (!Number.isInteger(options.atrPeriod) || options.atrPeriod < 1) {
    throw new Error('atrPeriod must be a positive integer');
  }

  if (options.activeAllocationPct.some((pct) => pct <= 0 || pct >= 100)) {
    throw new Error('activeAllocationPct values must be greater than 0 and less than 100');
  }

  if (!hasValidChannelPair(options)) {
    throw new Error('At least one exitPeriod value must be less than an entryPeriod value');
  }

  if (options.marketRegimeMa.some((ma) => ma > 0) && !options.marketRegimeSymbol) {
    throw new Error('marketRegimeSymbol is required when marketRegimeMa is greater than 0');
  }

  if (options.relativeStrengthLookback.some((lookback) => lookback > 0) && !options.relativeStrengthSymbol) {
    throw new Error('relativeStrengthSymbol is required when relativeStrengthLookback is greater than 0');
  }
};

const parseRanges = (value) => value.split(',').map((range) => {
  const [from, to] = range.split(':');
  if (!from || !to) {
    throw new Error(`Invalid range: ${range}`);
  }

  return { from, to };
});

function hasValidChannelPair(options) {
  return options.entryPeriod.some((entryPeriod) => (
    options.exitPeriod.some((exitPeriod) => exitPeriod < entryPeriod)
  ));
}

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

function parsePositiveNumberList(value, label) {
  const values = String(value).split(',').map((item) => item.trim()).filter(Boolean);
  if (!values.length) {
    throw new Error(`${label} must include at least one positive number`);
  }

  return values.map((item) => {
    const parsed = Number(item);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new Error(`${label} must include only positive numbers`);
    }

    return parsed;
  });
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

function parseNonNegativeIntegerList(value, label) {
  const values = String(value).split(',').map((item) => item.trim()).filter(Boolean);
  if (!values.length) {
    throw new Error(`${label} must include at least one non-negative integer`);
  }

  return values.map((item) => {
    const parsed = Number(item);
    if (!Number.isInteger(parsed) || parsed < 0) {
      throw new Error(`${label} must include only non-negative integers`);
    }

    return parsed;
  });
}

function parseBooleanList(value, label) {
  const values = String(value).split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
  if (!values.length) {
    throw new Error(`${label} must include at least one boolean`);
  }

  return values.map((item) => {
    if (['true', '1', 'yes'].includes(item)) {
      return true;
    }

    if (['false', '0', 'no'].includes(item)) {
      return false;
    }

    throw new Error(`${label} must include only boolean values`);
  });
}

function parseEntryRankList(value) {
  const validRanks = ['alphabetical', 'momentum63', 'momentum126'];
  const values = String(value).split(',').map((item) => item.trim()).filter(Boolean);
  if (!values.length) {
    throw new Error('entryRank must include at least one value');
  }

  return values.map((item) => {
    if (!validRanks.includes(item)) {
      throw new Error(`entryRank must include only: ${validRanks.join(', ')}`);
    }

    return item;
  });
}

const formatDateForFile = (date) => date.toISOString().replace(/[:.]/g, '-');

const getDefaultOutputPath = () => {
  const filename = `hybrid-results-${formatDateForFile(new Date())}.csv`;
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

  return {
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : 0,
    medianTradePnl: median(exits.map((trade) => trade.pnl)),
  };
};

const summarizeResult = ({
  range,
  symbols,
  options,
  result,
  activeResult,
}) => {
  const totalReturn = ((result.finalEquity - options.initialCapital) / options.initialCapital) * 100;
  const years = yearsBetween(result.startDate, result.endDate);
  const cagr = years > 0 && result.finalEquity > 0
    ? ((result.finalEquity / options.initialCapital) ** (1 / years) - 1) * 100
    : 0;
  const equityReturns = calculateEquityReturns(result.equityCurve);
  const dailyVolatility = standardDeviation(equityReturns);
  const downsideDeviation = standardDeviation(equityReturns.filter((value) => value < 0));
  const exits = activeResult.trades.filter((trade) => trade.type === 'Exit');
  const tradeQuality = summarizeTrades(exits);

  return {
    from: range.from,
    to: range.to,
    symbolCount: symbols.length,
    symbols: symbols.join(' '),
    initialCapital: options.initialCapital,
    coreSymbol: options.coreSymbol,
    coreAllocationPct: round(100 - options.activeAllocationPct),
    activeAllocationPct: options.activeAllocationPct,
    activeInitialCapital: round(options.activeInitialCapital),
    riskPercent: options.riskPercent,
    allowShort: options.allowShort,
    entryPeriod: options.entryPeriod,
    exitPeriod: options.exitPeriod,
    atrPeriod: options.atrPeriod,
    maxUnits: options.maxUnits,
    maxOpenPositions: options.maxOpenPositions,
    entryRank: options.entryRank,
    slippageBps: options.slippageBps,
    maxVolumeParticipationPct: options.maxVolumeParticipationPct,
    gapAwareFills: options.gapAwareFills,
    marketRegimeSymbol: options.marketRegimeMa > 0 ? options.marketRegimeSymbol : '',
    marketRegimeMa: options.marketRegimeMa,
    relativeStrengthSymbol: options.relativeStrengthLookback > 0 ? options.relativeStrengthSymbol : '',
    relativeStrengthLookback: options.relativeStrengthLookback,
    startDate: result.startDate,
    endDate: result.endDate,
    finalEquity: round(result.finalEquity),
    coreFinalEquity: round(result.coreFinalEquity),
    activeFinalEquity: round(result.activeFinalEquity),
    totalReturnPct: round(totalReturn),
    maxDrawdownPct: round(result.maxDrawdown),
    returnToMaxDrawdown: round(result.maxDrawdown > 0 ? totalReturn / result.maxDrawdown : 0, 3),
    cagrPct: round(cagr),
    equityVolatilityPct: round(dailyVolatility * Math.sqrt(252) * 100),
    sharpe: round(dailyVolatility > 0 ? (average(equityReturns) / dailyVolatility) * Math.sqrt(252) : 0, 3),
    sortino: round(downsideDeviation > 0 ? (average(equityReturns) / downsideDeviation) * Math.sqrt(252) : 0, 3),
    averageExposurePct: round(result.averageExposurePct),
    activeTotalTrades: activeResult.totalTrades,
    activeEntries: activeResult.entries,
    activeAddedUnits: activeResult.addedUnits,
    activeWinningTrades: activeResult.winningTrades,
    activeLosingTrades: Math.max(0, activeResult.totalTrades - activeResult.winningTrades),
    activeWinRatePct: round(activeResult.winRate),
    activeProfitFactor: round(tradeQuality.profitFactor, 3),
    activeMarketRegimeBlockedEntries: activeResult.marketRegime.blockedEntries,
    activeRelativeStrengthBlockedEntries: activeResult.relativeStrength.blockedEntries,
    error: '',
  };
};

const summarizeError = ({ range, symbols, options, error }) => ({
  from: range.from,
  to: range.to,
  symbolCount: symbols.length,
  symbols: symbols.join(' '),
  initialCapital: options.initialCapital,
  coreSymbol: options.coreSymbol,
  coreAllocationPct: round(100 - options.activeAllocationPct),
  activeAllocationPct: options.activeAllocationPct,
  activeInitialCapital: round(options.activeInitialCapital),
  riskPercent: options.riskPercent,
  allowShort: options.allowShort,
  entryPeriod: options.entryPeriod,
  exitPeriod: options.exitPeriod,
  atrPeriod: options.atrPeriod,
  maxUnits: options.maxUnits,
  maxOpenPositions: options.maxOpenPositions,
  entryRank: options.entryRank,
  slippageBps: options.slippageBps,
  maxVolumeParticipationPct: options.maxVolumeParticipationPct,
  gapAwareFills: options.gapAwareFills,
  marketRegimeSymbol: options.marketRegimeMa > 0 ? options.marketRegimeSymbol : '',
  marketRegimeMa: options.marketRegimeMa,
  relativeStrengthSymbol: options.relativeStrengthLookback > 0 ? options.relativeStrengthSymbol : '',
  relativeStrengthLookback: options.relativeStrengthLookback,
  startDate: '',
  endDate: '',
  finalEquity: '',
  coreFinalEquity: '',
  activeFinalEquity: '',
  totalReturnPct: '',
  maxDrawdownPct: '',
  returnToMaxDrawdown: '',
  cagrPct: '',
  equityVolatilityPct: '',
  sharpe: '',
  sortino: '',
  averageExposurePct: '',
  activeTotalTrades: '',
  activeEntries: '',
  activeAddedUnits: '',
  activeWinningTrades: '',
  activeLosingTrades: '',
  activeWinRatePct: '',
  activeProfitFactor: '',
  activeMarketRegimeBlockedEntries: '',
  activeRelativeStrengthBlockedEntries: '',
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

const buildEquityRows = ({ range, options, result }) => result.equityCurve.map((point) => ({
  from: range.from,
  to: range.to,
  coreSymbol: options.coreSymbol,
  coreAllocationPct: round(100 - options.activeAllocationPct),
  activeAllocationPct: options.activeAllocationPct,
  riskPercent: options.riskPercent,
  entryPeriod: options.entryPeriod,
  exitPeriod: options.exitPeriod,
  maxUnits: options.maxUnits,
  maxOpenPositions: options.maxOpenPositions,
  entryRank: options.entryRank,
  relativeStrengthSymbol: options.relativeStrengthLookback > 0 ? options.relativeStrengthSymbol : '',
  relativeStrengthLookback: options.relativeStrengthLookback,
  date: point.date,
  equity: round(point.equity),
  cash: round(point.cash),
  exposurePct: round(point.exposurePct),
  coreEquity: round(point.coreEquity),
  activeEquity: round(point.activeEquity),
  coreCash: round(point.coreCash),
  activeCash: round(point.activeCash),
  coreExposurePct: round(point.coreExposurePct),
  activeExposurePct: round(point.activeExposurePct),
  positions: point.positions,
  activeOpenPositions: point.activeOpenPositions,
}));

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

const subtractCalendarDays = (dateText, days) => {
  const date = new Date(`${dateText}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
};

const loadMarketRegimePrices = async ({ symbol, range, maPeriod }) => {
  if (!symbol || maPeriod < 1) {
    return null;
  }

  const warmupDays = Math.ceil(maPeriod * 2);
  return dataProvider.getHistoricalPrices({
    symbol,
    from: subtractCalendarDays(range.from, warmupDays),
    to: range.to,
    interval: '1d',
  });
};

const loadRelativeStrengthPrices = async ({ symbol, range, lookback }) => {
  if (!symbol || lookback < 1) {
    return null;
  }

  const warmupDays = Math.ceil(lookback * 2);
  return dataProvider.getHistoricalPrices({
    symbol,
    from: subtractCalendarDays(range.from, warmupDays),
    to: range.to,
    interval: '1d',
  });
};

const buildCombinations = (options) => {
  const combinations = [];
  options.ranges.forEach((range) => {
    options.activeAllocationPct.forEach((activeAllocationPct) => {
      options.riskPercent.forEach((riskPercent) => {
        options.entryPeriod.forEach((entryPeriod) => {
          options.exitPeriod.forEach((exitPeriod) => {
            if (exitPeriod >= entryPeriod) {
              return;
            }

            options.maxUnits.forEach((maxUnits) => {
              options.maxOpenPositions.forEach((maxOpenPositions) => {
                options.entryRank.forEach((entryRank) => {
                  options.slippageBps.forEach((slippageBps) => {
                    options.maxVolumeParticipationPct.forEach((maxVolumeParticipationPct) => {
                      options.gapAwareFills.forEach((gapAwareFills) => {
                        options.marketRegimeMa.forEach((marketRegimeMa) => {
                          options.relativeStrengthLookback.forEach((relativeStrengthLookback) => {
                            combinations.push({
                              range,
                              activeAllocationPct,
                              riskPercent,
                              entryPeriod,
                              exitPeriod,
                              maxUnits,
                              maxOpenPositions,
                              entryRank,
                              slippageBps,
                              maxVolumeParticipationPct,
                              gapAwareFills,
                              marketRegimeMa,
                              relativeStrengthLookback,
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  return combinations;
};

const main = async () => {
  const options = await parseArgs(process.argv.slice(2));
  if (options.help) {
    printUsage();
    return;
  }

  const combinations = buildCombinations(options);
  if (options.dryRun) {
    combinations.forEach((combo, index) => {
      const coreAllocationPct = 100 - combo.activeAllocationPct;
      console.log(`${index + 1}. ${combo.range.from} to ${combo.range.to} symbols=${options.symbols.length} core=${options.coreSymbol}:${coreAllocationPct}% active=${combo.activeAllocationPct}% riskPercent=${combo.riskPercent} entryPeriod=${combo.entryPeriod} exitPeriod=${combo.exitPeriod} maxUnits=${combo.maxUnits} maxOpenPositions=${combo.maxOpenPositions} entryRank=${combo.entryRank} slippageBps=${combo.slippageBps} maxVolumeParticipationPct=${combo.maxVolumeParticipationPct} gapAwareFills=${combo.gapAwareFills} marketRegimeSymbol=${combo.marketRegimeMa > 0 ? options.marketRegimeSymbol : ''} marketRegimeMa=${combo.marketRegimeMa} relativeStrengthSymbol=${combo.relativeStrengthLookback > 0 ? options.relativeStrengthSymbol : ''} relativeStrengthLookback=${combo.relativeStrengthLookback}`);
    });
    console.log(`Planned ${combinations.length} hybrid runs.`);
    return;
  }

  const rows = [];
  const equityRows = [];

  for (const [index, combo] of combinations.entries()) {
    const {
      range,
      activeAllocationPct,
      riskPercent,
      entryPeriod,
      exitPeriod,
      maxUnits,
      maxOpenPositions,
      entryRank,
      slippageBps,
      maxVolumeParticipationPct,
      gapAwareFills,
      marketRegimeMa,
      relativeStrengthLookback,
    } = combo;
    const activeInitialCapital = options.initialCapital * (activeAllocationPct / 100);
    const coreInitialCapital = options.initialCapital - activeInitialCapital;
    const runOptions = {
      ...options,
      activeAllocationPct,
      activeInitialCapital,
      riskPercent,
      entryPeriod,
      exitPeriod,
      maxUnits,
      maxOpenPositions,
      entryRank,
      slippageBps,
      maxVolumeParticipationPct,
      gapAwareFills,
      marketRegimeSymbol: marketRegimeMa > 0 ? options.marketRegimeSymbol : '',
      marketRegimeMa,
      relativeStrengthSymbol: relativeStrengthLookback > 0 ? options.relativeStrengthSymbol : '',
      relativeStrengthLookback,
    };
    const coreAllocationPct = 100 - activeAllocationPct;
    const label = `${range.from} to ${range.to} symbols=${options.symbols.length} core=${options.coreSymbol}:${coreAllocationPct}% active=${activeAllocationPct}% riskPercent=${riskPercent} entryPeriod=${entryPeriod} exitPeriod=${exitPeriod} maxUnits=${maxUnits} maxOpenPositions=${maxOpenPositions} entryRank=${entryRank} relativeStrengthLookback=${relativeStrengthLookback}`;
    process.stdout.write(`[${index + 1}/${combinations.length}] ${label} ... `);

    try {
      const [priceBySymbol, corePriceBySymbol, marketRegimePrices, relativeStrengthPrices] = await Promise.all([
        loadPriceBySymbol({
          symbols: options.symbols,
          range,
        }),
        loadPriceBySymbol({
          symbols: [options.coreSymbol],
          range,
        }),
        loadMarketRegimePrices({
          symbol: options.marketRegimeSymbol,
          range,
          maPeriod: marketRegimeMa,
        }),
        loadRelativeStrengthPrices({
          symbol: options.relativeStrengthSymbol,
          range,
          lookback: relativeStrengthLookback,
        }),
      ]);

      const coreResult = benchmarkStrategy.simulateBuyAndHold({
        priceBySymbol: corePriceBySymbol,
        initialCapital: coreInitialCapital,
      });
      const activeResult = portfolioStrategy.simulatePortfolioTrading({
        priceBySymbol,
        initialCapital: activeInitialCapital,
        riskPercent,
        allowShort: options.allowShort,
        entryPeriod,
        exitPeriod,
        atrPeriod: options.atrPeriod,
        maxUnits,
        maxOpenPositions,
        entryRank,
        slippageBps,
        maxVolumeParticipationPct,
        gapAwareFills,
        marketRegimeSymbol: marketRegimeMa > 0 ? options.marketRegimeSymbol : null,
        marketRegimePrices,
        marketRegimeMa,
        relativeStrengthSymbol: relativeStrengthLookback > 0 ? options.relativeStrengthSymbol : null,
        relativeStrengthPrices,
        relativeStrengthLookback,
      });
      const result = hybridStrategy.combineEquityCurves({
        coreResult,
        activeResult,
        initialCapital: options.initialCapital,
      });
      rows.push(summarizeResult({
        range,
        symbols: options.symbols,
        options: runOptions,
        result,
        activeResult,
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
