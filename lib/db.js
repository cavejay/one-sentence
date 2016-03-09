var mongo = require('mongojs');
var mongoURI = require('../mongoKey');

// mongodb://<dbuser>:<dbpassword>@ds034878.mongolab.com:34878/sentence-diary

var db = mongo(mongoURI, ['entries', 'users']);

/* Blindly add a new user to the db */
var addUser = function addUser (user) {
  db.users.insert({
    userid: user.id,
    name: user.print_name,
    reminder: false
  });
};

/* State must be either a time or false */
var setReminderForUser = function setReminderForUser (id, time, cb) {
  db.users.findAndModify({
    query: {userid: id},
    update: {$set: {reminder: time}},
    new: true
  }, function (err, doc, lastErrorObject) {
    if (err) console.err('Couldn\'t update the db');
    cb(err);
  });
};

/* return a user's information */
var getUser = function getUser (id, cb) {
  db.users.findOne({userid: id}, cb);
};

/* Add an entry to the db */
var addEntry = function addEntry (id, text, date, cb) {
  if (!cb) cb = function () {}; // there was no callback, lets make a simple one
  // Pull information about user using id and user collection here

  // Encrypt the user's information here

  // Send the diary entry here
  db.entries.insert({
    text: text,
    user: id,
    date: date
  }, cb); // cb gets (err, document)
};

// Construct the callable functions
module.exports.db = db;
module.exports.dbAddEntry = addEntry;
module.exports.dbAddUser = addUser;
module.exports.dbGetUser = getUser;
module.exports.dbSetReminder = setReminderForUser;
