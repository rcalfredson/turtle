'use strict';

const fs = require('fs');

module.exports = (path, options, cb) => {
  fs.readFile(path, (err, content) => {
    if (err) {
      return cb(new Error(err));
    }

    const rendered = content.toString();

    return cb(null, rendered);
  });
};
