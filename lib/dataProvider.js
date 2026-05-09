'use strict';

const builtInFetch = typeof fetch !== 'undefined' ? fetch : null;
const fetchFn = builtInFetch || require('node-fetch');

const buildYahooSearchUrl = (query) => {
  const encoded = encodeURIComponent(query.trim());
  return `https://query2.finance.yahoo.com/v1/finance/search?q=${encoded}&quotesCount=20&newsCount=0`;
};

const toUnixSeconds = (date) => Math.floor(date.getTime() / 1000);

const parseDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const addDays = (date, days) => {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const buildYahooChartUrl = ({ symbol, range = '5y', interval = '1d', from, to }) => {
  const encoded = encodeURIComponent(symbol.trim());
  const params = new URLSearchParams({
    interval,
    events: 'div|split',
  });

  const fromDate = parseDate(from);
  const toDate = parseDate(to);
  if (fromDate && toDate) {
    params.set('period1', String(toUnixSeconds(fromDate)));
    params.set('period2', String(toUnixSeconds(addDays(toDate, 1))));
  } else {
    params.set('range', range);
  }

  return `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?${params.toString()}`;
};

const searchSymbols = async (query) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const url = buildYahooSearchUrl(query);
  const response = await fetchFn(url);
  if (!response.ok) {
    throw new Error(`Symbol search failed: ${response.statusText}`);
  }

  const payload = await response.json();
  if (!payload.quotes) {
    return [];
  }

  return payload.quotes.map((item) => ({
    symbol: item.symbol,
    name: item.shortname || item.longname || item.symbol,
    exchange: item.exchange || item.exchDisp || '',
    type: item.quoteType || item.typeDisplay || 'Unknown',
  }));
};

const parseYahooChart = (payload, symbol) => {
  const chartError = payload && payload.chart && payload.chart.error;
  if (chartError) {
    throw new Error(`Yahoo chart error for ${symbol}: ${chartError.description || chartError.code || 'unknown error'}`);
  }

  if (!payload || !payload.chart || !payload.chart.result || !payload.chart.result[0]) {
    throw new Error(`No price data found for ${symbol}`);
  }

  const result = payload.chart.result[0];
  const timestamps = result.timestamp || [];
  const quote = result.indicators && result.indicators.quote && result.indicators.quote[0];
  if (!quote || !quote.close || !quote.open || !quote.high || !quote.low) {
    throw new Error(`Invalid price data for ${symbol}`);
  }

  return timestamps.map((timestamp, index) => ({
    date: new Date(timestamp * 1000).toISOString().slice(0, 10),
    open: quote.open[index],
    high: quote.high[index],
    low: quote.low[index],
    close: quote.close[index],
    volume: quote.volume ? quote.volume[index] : null,
  })).filter((bar) => (
    Number.isFinite(bar.open) &&
    Number.isFinite(bar.high) &&
    Number.isFinite(bar.low) &&
    Number.isFinite(bar.close)
  ));
};

const getHistoricalPrices = async ({ symbol, range = '5y', interval = '1d', from, to }) => {
  if (!symbol || !symbol.trim()) {
    throw new Error('Missing symbol');
  }

  const url = buildYahooChartUrl({ symbol, range, interval, from, to });
  const response = await fetchFn(url);
  if (!response.ok) {
    throw new Error(`Unable to load history: ${response.statusText}`);
  }

  const payload = await response.json();
  return parseYahooChart(payload, symbol);
};

module.exports = {
  searchSymbols,
  getHistoricalPrices,
};
