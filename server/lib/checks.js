checks = {};
log = require('./log');

checks.checkUsernameValidity = function (str) {
  return str.match(/\s/) == null;
}

checks.checkPasswordValidity = function (str) {
  return str.match(/\s/) == null;
}

checks.checkEmailValidity = function (str) {
  return str.match(/@.*\./) !== null;
}

exports = module.exports = checks;
