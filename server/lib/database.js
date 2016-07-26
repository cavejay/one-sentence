var r = require('rethinkdbdash');
var database = {};

// callback = function(data) {}
// callback = function(data, error) {}
// where:
// data contains the data captured as a json
// error is a generic enum for why the data wasn't captured

// user = {
// 	_id = unique user id, // filled by mongo
// 	name = [first, last],
// 	username = '',
// 	pwhash = '',
//  settings = {
//		daily_reminder = true,
// 		allow_tracking = true,
//	}
// 	entries = [
// 		{
// 			datetime: '',
// 			data: '',
// 		},
// 	]
// }

database.init = function() {
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


/***************	Diary Entries	***************/

database.getEntry = function(user, entryid, callback) {

}

database.updateEntry = function(user, entryid, entry_object, callback) {

}

database.makeEntry = function(user, entry_object, callback) {

}

database.removeEntry = function(user, entryid, callback) {

}

var verifyUserSettings = function(user_settings) {

}

var verifyEntry = function(entry_object) {

}

exports = module.exports = database;
