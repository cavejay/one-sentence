checks = {};
log = require('./log');

checks.checkUsernameValidity = function (str) {
  // no length restriction but can't have access to certain chars
  return str.match(/^[a-zA-Z0-9\-_]+$/) !== null;
}

checks.checkPasswordValidity = function (str) {
  if (str.length < 8) return false;
  if ((str.match(/[0-9]/g) || []).length < 1) return false;
  if ((str.match(/[A-Z]/g) || []).length < 1) return false;
  if ((str.match(/[a-z]/g) || []).length < 1) return false;
  return str.match(/^[a-zA-Z0-9#.*&^%$@!\-\_]+$/) !== null;
}

checks.checkEmailValidity = function (str) {
  if ((str.match(/@/g) || []).length > 1) return false;
  return str.match(/^[\w.-_]+@[\w-.]+\.\w\w\w?$/) !== null;
}

exports = module.exports = checks;
