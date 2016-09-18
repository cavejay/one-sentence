log = {};

loggingLevel = 0;
log.DEBUG = 0;
log.PROD = 1;

var base = function base (str, args) {
  if (loggingLevel == 1 || str == '[ERROR] ') {
    return;
  }
  arglist = Array.prototype.slice.call(args);
  arglist[0] = str+args[0];
  console.log.apply(this, arglist);
}

log.config = function (c) {
  if (c.level != undefined && c.level >= 0 && c.level <= 1) {
    loggingLevel = c.level;
  }
}

log.api = function (str) {
  base('[API] ', arguments);
}

log.session = function (str) {
  base('[SESSION] ', arguments);
}

log.info = function (str) {
  base('[INFO]', arguments);
}

log.a = function (str) {
  base('', arguments);
}

log.test = function (str) {
  base('[TEST] ', arguments);
}

log.database = function (str) {
  base('[DATABASE] ', arguments);
}

log.error = function (str) {
  base('[ERROR] ', arguments);
}

exports = module.exports = log
