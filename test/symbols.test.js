'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { parseSymbolFileContent, parseSymbols } = require('../lib/symbols');

test('parseSymbols accepts comma and whitespace separated symbols', () => {
  assert.deepEqual(parseSymbols('spy, qqq\nIWM DIA'), ['SPY', 'QQQ', 'IWM', 'DIA']);
});

test('parseSymbols removes duplicate symbols while preserving order', () => {
  assert.deepEqual(parseSymbols('SPY,QQQ,spy,XLK,QQQ'), ['SPY', 'QQQ', 'XLK']);
});

test('parseSymbolFileContent ignores comments', () => {
  const content = `
# Broad market
SPY, QQQ

# Sector ETFs
XLK
XLF # financials
`;

  assert.deepEqual(parseSymbolFileContent(content), ['SPY', 'QQQ', 'XLK', 'XLF']);
});
