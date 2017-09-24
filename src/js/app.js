(function app() {
  'use strict';

  window.addEventListener('DOMContentLoaded', function appDCL() {
    console.log('Hello World'); // eslint-disable-line no-console
    fetch('/getFourWeekBreakout?sym=RAD').then(function (response) { // eslint-disable-line func-names
      
      return response.json();
    }).then(function (json) { // eslint-disable-line func-names
      console.log(json); // eslint-disable-line no-console
    });
  });
}());
