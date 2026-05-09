'use strict';

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || 'localhost';

module.exports = {
  port,
  url: `http://${host}:${port}`,
};
