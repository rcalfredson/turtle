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
