// For testing
var r = require('rethinkdbdash')();
var db = require('./database');
var assert = require('chai').assert;
utils = {};

var cleanTables = () => {
  var t = function (a) {
    if (a.length > 1) {
      return r.tableDrop(a.shift()).run().then(() => {
        return t(a);
      });
    } else if (a.length == 1) {
      return r.tableDrop(a.shift()).run();
    } else {
      return r.tableList().run();
    }
  };

  return r.tableList().run().then(tables => {
    return t(tables);
  });
}

utils.beforeEach = (done) => {
  r.tableList().run().then(result => {
    if (result.length > 0) {
      log.test('There are uncleaned Tables: ', result);
    }
    return cleanTables();
  }).then(() => {
    return r.tableCreate('test').run();
  }).then(result => {
    done();
  });
}

utils.afterEach = (done) => {
  cleanTables().then(() => {
    done();
  });
}

exports = module.exports = utils;
