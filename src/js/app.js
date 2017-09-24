(function app() {
  'use strict';

  const renderFourWeekBreakout = function renderFourWeekBreakout(symbol) {
    fetch('/detectFourWeekBreakout?sym=' + symbol).then(function returnJSON(response) {
      return response.json();
    }).then(function printJSON(json) {
      console.log(json); // eslint-disable-line no-console
    });
  };

  window.addEventListener('DOMContentLoaded', function appDCL() {
    console.log('Hello World'); // eslint-disable-line no-console
    renderFourWeekBreakout('RAD');
  });
}());
