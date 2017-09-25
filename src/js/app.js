(function app() {
  'use strict';

  const renderFourWeekBreakout = function renderFourWeekBreakout(symbol) {
    fetch('/detectFourWeekBreakout?sym=' + symbol).then(function returnJSON(response) {
      return response.json();
    }).then(function printJSON(json) {
      console.log(json); // eslint-disable-line no-console
      document.getElementById('results').innerHTML = 'Blag';
    });
  };

  const updateTickerOptions = function updateTickerOptions() {
    var symbol = document.getElementById('tickersearch').value,
        options = 'Results so far:<br />',
        i = 0,
        totLength = 0;
    console.log('pressed key'); // eslint-disable-line no-console
    console.log(symbol);
    fetch('getTickerSymbols?sym=' + symbol).then(function returnJSON(response) {
      return response.json();
    }).then(function printJSON(json) {
      if (!json.securities.security) {
        document.getElementById('results').innerHTML = 'Sorry, no results found.';
      }
      else {
        if (json.securities.security.length < 10) {
          totLength = json.securities.security.length;
        }
        else {
          totLength = 10;
        }
        for (i = 0; i < totLength; i++) {
          console.log(json.securities.security[i].symbol[0]);
          options += json.securities.security[i].symbol[0] + ' - ' + json.securities.security[i].description[0] + '<br />';
        }
        document.getElementById('results').innerHTML = options;
        console.log(json);
      }
    });
  };

  window.addEventListener('DOMContentLoaded', function appDCL() {
    console.log('Hello World'); // eslint-disable-line no-console
    renderFourWeekBreakout('RAD');
    document.getElementById('tickersearch').addEventListener('input', updateTickerOptions);
  });
}());
