'use strict';

//////////////////////////////
// Requires
//////////////////////////////
const express = require('express');

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const appEnv = require('./lib/env');
const renderer = require('./lib/render');
const stockData = require('./lib/stockdata');

//////////////////////////////
// App Variables
//////////////////////////////
const app = express();

app.engine('html', renderer);
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/detectFourWeekBreakout', stockData.detectFourWeekBreakout);

//////////////////////////////
// Start the server
//////////////////////////////
app.listen(appEnv.port, () => {
  // Mean to console.log out, so disabling
  console.log(`Server starting on ${appEnv.url}`); // eslint-disable-line no-console
  if (fs.existsSync('.env')) {
    console.log('Found local config file'); // eslint-disable-line no-console
    dotenv.config();
  }
});
