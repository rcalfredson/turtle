'use strict';

const assert = require('node:assert/strict');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const test = require('node:test');

const dataProvider = require('../lib/dataProvider');

const chartPayload = (close = 101) => ({
  chart: {
    result: [{
      timestamp: [1704067200],
      indicators: {
        quote: [{
          open: [100],
          high: [102],
          low: [99],
          close: [close],
          volume: [1000],
        }],
      },
    }],
    error: null,
  },
});

const withTempCache = async (fn) => {
  const previousCacheDir = process.env.MARKET_DATA_CACHE_DIR;
  const previousCache = process.env.MARKET_DATA_CACHE;
  const previousTtl = process.env.MARKET_DATA_CACHE_TTL_HOURS;
  const cacheDir = await fs.mkdtemp(path.join(os.tmpdir(), 'turtle-market-cache-'));

  process.env.MARKET_DATA_CACHE_DIR = cacheDir;
  delete process.env.MARKET_DATA_CACHE;
  delete process.env.MARKET_DATA_CACHE_TTL_HOURS;

  try {
    await fn(cacheDir);
  } finally {
    if (previousCacheDir === undefined) {
      delete process.env.MARKET_DATA_CACHE_DIR;
    } else {
      process.env.MARKET_DATA_CACHE_DIR = previousCacheDir;
    }

    if (previousCache === undefined) {
      delete process.env.MARKET_DATA_CACHE;
    } else {
      process.env.MARKET_DATA_CACHE = previousCache;
    }

    if (previousTtl === undefined) {
      delete process.env.MARKET_DATA_CACHE_TTL_HOURS;
    } else {
      process.env.MARKET_DATA_CACHE_TTL_HOURS = previousTtl;
    }

    dataProvider._private.resetFetchFnForTests();
    await fs.rm(cacheDir, { recursive: true, force: true });
  }
};

test('historical prices are cached on disk by Yahoo chart URL', async () => {
  await withTempCache(async (cacheDir) => {
    let fetchCount = 0;
    dataProvider._private.setFetchFnForTests(async () => {
      fetchCount += 1;
      return {
        ok: true,
        json: async () => chartPayload(101),
      };
    });

    const request = {
      symbol: 'AAPL',
      from: '2024-01-01',
      to: '2024-01-02',
      interval: '1d',
    };

    const first = await dataProvider.getHistoricalPrices(request);
    const second = await dataProvider.getHistoricalPrices(request);

    assert.equal(fetchCount, 1);
    assert.deepEqual(first, second);
    assert.equal(second[0].close, 101);

    const files = await fs.readdir(cacheDir);
    assert.equal(files.length, 1);
  });
});

test('historical price cache can be disabled with MARKET_DATA_CACHE=false', async () => {
  await withTempCache(async (cacheDir) => {
    process.env.MARKET_DATA_CACHE = 'false';
    let fetchCount = 0;
    dataProvider._private.setFetchFnForTests(async () => {
      fetchCount += 1;
      return {
        ok: true,
        json: async () => chartPayload(100 + fetchCount),
      };
    });

    const request = {
      symbol: 'MSFT',
      from: '2024-01-01',
      to: '2024-01-02',
      interval: '1d',
    };

    const first = await dataProvider.getHistoricalPrices(request);
    const second = await dataProvider.getHistoricalPrices(request);

    assert.equal(fetchCount, 2);
    assert.equal(first[0].close, 101);
    assert.equal(second[0].close, 102);
    assert.deepEqual(await fs.readdir(cacheDir), []);
  });
});
