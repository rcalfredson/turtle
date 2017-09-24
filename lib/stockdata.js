'use strict';

const fetch = require('node-fetch');
const alphaVantageURL = 'https://www.alphavantage.co/query?';

const getFourWeekBreakout = function (req, res) {
  const url = `${alphaVantageURL}function=TIME_SERIES_DAILY&symbol=${req.query.sym}&apikey=${process.env.alphaVantageKey}`;
  const dailyStr = 'Time Series (Daily)'
  let highMostRecent = 0;
  let totDays = 28;
  let dayCount = 0;
  let foundBreakout = true;

  return fetch(url, { method: 'GET' }).then((resp) => {
    return resp.json();
  }).then((dailyData) => {
    for (var key in dailyData[dailyStr]) {
      if (dayCount == 0) {
        highMostRecent = dailyData[dailyStr][key]['2. high'];
      } else if (dayCount > 0 && dayCount < totDays) {
        if (highMostRecent < dailyData[dailyStr][key]['2. high']) {
          foundBreakout = false;
          break;
        }
      } else {
        break;
      }
      dayCount++;
    }
    res.send({foundBreakout: foundBreakout, highMostRecent: highMostRecent});
  });
};

module.exports = {
  getFourWeekBreakout,
};
