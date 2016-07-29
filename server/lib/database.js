var r = require('rethinkdbdash');
var database = {};

// callback = function(data) {}
// callback = function(data, error) {}
// where:
// data contains the data captured as a json
// error is a generic enum for why the data wasn't captured
// -===-
// Functions return a promise if there is no callback

// user = {
// 	 _id = unique user id, // filled by mongo
//   name = [first, last],
//   username = '',
//   pwhash = '',
//   settings = {
// 	   daily_reminder = true,
//     allow_tracking = true,
//   }
// }

/**
 * Returns a promise when finished
 */
database.init = function () {
  // a simple temp function
  var makeEntriesTable = function (tables) {
    if (!tables.contains('entries')) {
      console.log('[DATABASE] No \'entries\' table');
      return r.tableCreate('entries').run().then(() => {
        console.log('[DATABASE] Created \'entries\' table');
      });
    }
  }

  return r.tableList().run().then(tables => {
    if (!tables.contains('users')) {
      console.log('[DATABASE] No \'users\' table');
      return r.tableCreate('users').run().then(() => {
        console.log('[DATABASE] Created \'users\' table');
        return makeEntriesTable(tables);
      });
    } // else make an entries table
    return makeEntriesTable(tables);
  })
}

/***************	User	***************/

database.makeUser = function(user_object, callback) {

}

database.removeUser = function(user_uid, callback) {

}

database.getUserSettings = function(user_uid, callback, reqData) {

}

database.updateUserSettings = function(user_uid, user_settings, callback) {

}

// callback is passed true or false depending on whether the user exists.
database.checkForUser = function(user_uid, callback, data) {

}

// entry = {
//   uid: '',
//   datetime: '',
// 	 text: '',
//   oldtext: '',
//   deleted: false
// }

/***************	Diary Entries	***************/
database.getEntry = function(uid, entryid, callback) {

}

database.getEntryRange = function(uid, from, to, callback) {

}

database.updateEntry = function(uid, entryid, entry_object, callback) {

}

database.makeEntry = function(uid, entry_object, callback) {

}

database.removeEntry = function(uid, entryid, callback) {

}

// Used to ensure the entry is valid
var verifyEntry = function(entry_object) {

}

exports = module.exports = database;
