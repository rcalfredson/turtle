# turtle
A modernized web app for experimenting with the vanilla Richard Dennis turtle trading strategy.

This version uses server-side historical EOD data lookup, a simplified strategy engine, and a lightweight browser UI for ticker selection and backtesting.

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Run the app:

```bash
npm start
```

3. Open `http://localhost:3000`

> Requires Node.js 24 or newer.

## Market data cache

Yahoo historical chart responses are cached on disk in `.cache/market-data` for 24 hours by default. You can tune this with:

```bash
MARKET_DATA_CACHE=false
MARKET_DATA_CACHE_DIR=.cache/market-data
MARKET_DATA_CACHE_TTL_HOURS=24
```

## Matrix runner

Run ticker/date-range batches from the command line and write results to CSV:

```bash
npm run matrix
```

By default this runs the built-in 18-symbol by 4-date-range matrix and writes to `reports/matrix-results-*.csv`. Useful smaller runs:

```bash
npm run matrix -- --dry-run
npm run matrix -- --limit=3
npm run matrix -- --symbols=AAPL,SPY --ranges=2020-01-01:2024-12-31
```
