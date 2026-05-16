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

## Universe files

Portfolio and benchmark runners can load symbols from a text file with `--symbolsFile`.
Files may use commas, spaces, or newlines, and `#` starts a comment:

```bash
npm run portfolio -- --symbolsFile=universes/sector-etfs.txt --gapAwareFills=true --maxUnits=1 --slippageBps=5
npm run benchmarks -- --symbolsFile=universes/sector-etfs.txt --benchmarkSymbols=SPY,QQQ,IWM,DIA
```

Portfolio runs can also sweep same-day entry ordering with `--entryRank`.
Supported values are `alphabetical`, `momentum63`, and `momentum126`:

```bash
npm run portfolio -- --symbolsFile=universes/sp500-top100-established.txt --gapAwareFills=true --maxUnits=1 --slippageBps=5 --entryRank=alphabetical,momentum63,momentum126
```

Risk sizing can be swept with comma-separated `--riskPercent` values:

```bash
npm run portfolio -- --symbolsFile=universes/sp500-top100-established.txt --gapAwareFills=true --maxUnits=1 --slippageBps=5 --entryRank=momentum126 --riskPercent=0.25,0.5,1
```

Concurrent position limits can be swept with comma-separated `--maxOpenPositions` values:

```bash
npm run portfolio -- --symbolsFile=universes/sp500-top100-established.txt --gapAwareFills=true --maxUnits=1 --slippageBps=5 --entryRank=momentum126 --riskPercent=0.25 --maxOpenPositions=10,20,30
```

Market regime filters can gate new entries and add-ons with a broad-market moving average.
Use `--marketRegimeMa=0,200` to compare the unfiltered strategy with a prior-close `SPY` 200-day SMA filter:

```bash
npm run portfolio -- --symbolsFile=universes/sp500-top100-established.txt --gapAwareFills=true --slippageBps=5 --entryRank=momentum126 --riskPercent=0.25 --entryPeriod=55 --exitPeriod=50 --maxUnits=1,2,4 --marketRegimeSymbol=SPY --marketRegimeMa=0,200
```
