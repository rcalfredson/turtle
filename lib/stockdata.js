'use strict';

const fetch = require('node-fetch');
const alphaVantageURL = 'https://www.alphavantage.co/query?';

const detectFourWeekBreakout = function detectFourWeekBreakout(req, res) {
  const url = `${alphaVantageURL}function=TIME_SERIES_DAILY&symbol=${req.query.sym}&apikey=${process.env.alphaVantageKey}`;
  const dailyStr = 'Time Series (Daily)';
  const totDays = 28;
  let highMostRecent = 0;
  let dayCount = 0;
  let foundBreakout = true;
  let key = '';

  return fetch(url, { method: 'GET' }).then((resp) => {
    return resp.json();
  }).then((dailyData) => {
    for (key in dailyData[dailyStr]) {
      if (dayCount === 0) {
        highMostRecent = dailyData[dailyStr][key]['2. high'];
      }
      else if (dayCount > 0 && dayCount < totDays) {
        if (highMostRecent < dailyData[dailyStr][key]['2. high']) {
          foundBreakout = false;
          break;
        }
      }
      else {
        break;
      }
      dayCount++;
    }
    res.send({ foundBreakout,
      highMostRecent });
  });
};

module.exports = {
  detectFourWeekBreakout,
};
