var mongo = require('mongojs');
var database = {};
var url = 'mongodb://localhost:27017/one-sentence';
var db = null;

// callback = function(data) {}
// callback = function(data, error) {}
// where:
// data contains the data captured as a json
// error is a generic enum for why the data wasn't captured

// user = {
// 	_uid = 'some string',
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
	db = mongo(mongoURI, ['entries', 'users']);
}


/***************	User	***************/

database.makeUser = function(user_object, callback) {

}

database.removeUser = function(user_uid, callback) {

}

database.getUserSettings = function(user_uid, callback) {

}

database.updateUserSettings = function(user_uid, user_settings, callback) {

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



exports = module.exports = database;
