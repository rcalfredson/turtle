'use strict';

const fs = require('fs/promises');

function parseSymbols(value) {
  const seen = new Set();
  const symbols = [];

  String(value)
    .split(/[\s,]+/)
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean)
    .forEach((symbol) => {
      if (!seen.has(symbol)) {
        seen.add(symbol);
        symbols.push(symbol);
      }
    });

  return symbols;
}

function parseSymbolFileContent(content) {
  const uncommented = String(content)
    .split(/\r?\n/)
    .map((line) => line.replace(/#.*/, ''))
    .join('\n');

  return parseSymbols(uncommented);
}

async function loadSymbolsFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return parseSymbolFileContent(content);
}

module.exports = {
  loadSymbolsFile,
  parseSymbolFileContent,
  parseSymbols,
};
