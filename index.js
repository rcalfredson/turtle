'use strict';

//////////////////////////////
// Requires
//////////////////////////////
const express = require('express');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const appEnv = require('./lib/env');
const renderer = require('./lib/render');
const dataProvider = require('./lib/dataProvider');
const turtleStrategy = require('./lib/turtleStrategy');

if (fs.existsSync('.env')) {
  dotenv.config();
}

const app = express();
const symbolPattern = /^[A-Z0-9.\-^=]{1,20}$/i;
const debugMarketData = process.env.DEBUG_MARKET_DATA === 'true';

const summarizeBars = (bars) => ({
  count: bars.length,
  firstDate: bars.length ? bars[0].date : null,
  lastDate: bars.length ? bars[bars.length - 1].date : null,
});

const debugLog = (message, details) => {
  if (!debugMarketData) {
    return;
  }

  console.log(`[market-data] ${message}`, details); // eslint-disable-line no-console
};

const parsePositiveNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const isIsoDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) {
    return false;
  }

  return !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
};

app.engine('html', renderer);
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '100kb' }));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/api/symbols', async (req, res) => {
  try {
    const query = String(req.query.q || '').trim();
    const symbols = await dataProvider.searchSymbols(query);
    res.json({ symbols });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.post('/api/simulate', async (req, res) => {
  try {
    const body = req.body || {};
    const {
      symbol: rawSymbol,
      from,
      to,
    } = body;
    const symbol = String(rawSymbol || '').trim().toUpperCase();
    const initialCapital = parsePositiveNumber(body.initialCapital, Number(process.env.STARTING_CAPITAL) || 100000);
    const riskPercent = parsePositiveNumber(body.riskPercent, Number(process.env.RISK_PERCENT) || 1);

    if (!symbol || !from || !to) {
      return res.status(400).json({ error: 'symbol, from, and to are required' });
    }

    if (!symbolPattern.test(symbol)) {
      return res.status(400).json({ error: 'symbol contains unsupported characters' });
    }

    if (!isIsoDate(from) || !isIsoDate(to) || from > to) {
      return res.status(400).json({ error: 'from and to must be valid YYYY-MM-DD dates, with from before to' });
    }

    if (initialCapital < 1000 || initialCapital > 1000000000) {
      return res.status(400).json({ error: 'initialCapital must be between 1,000 and 1,000,000,000' });
    }

    if (riskPercent <= 0 || riskPercent > 10) {
      return res.status(400).json({ error: 'riskPercent must be greater than 0 and no more than 10' });
    }

    const prices = await dataProvider.getHistoricalPrices({
      symbol,
      from,
      to,
      interval: '1d',
    });
    const filtered = prices.filter((bar) => bar.date >= from && bar.date <= to);
    debugLog('history loaded', {
      symbol,
      requested: { from, to },
      allBars: summarizeBars(prices),
      filteredBars: summarizeBars(filtered),
    });

    if (filtered.length < 40) {
      return res.status(400).json({ error: 'Not enough historical data for the requested date range' });
    }

    const result = turtleStrategy.simulateTurtleTrading({
      prices: filtered,
      initialCapital,
      riskPercent,
    });

    res.json({ symbol, from, to, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//////////////////////////////
// Start the server
//////////////////////////////
app.listen(appEnv.port, () => {
  console.log(`Server starting on ${appEnv.url}`); // eslint-disable-line no-console
});
