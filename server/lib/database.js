var r = require('rethinkdbdash')();
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
    if (tables.indexOf('entries') < 0) {
      console.log('[DATABASE] No \'entries\' table');
      return r.tableCreate('entries').run().then(() => {
        console.log('[DATABASE] Created \'entries\' table');
      });
    }
  }

  return r.tableList().run().then(tables => {
    if (tables.indexOf('users') < 0) {
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

database.makeUser = function(username, first, last, pwhash, callback) {

}

database.removeUser = function(user_uid, callback) {

}

database.getUserSettings = function(user_uid, callback, reqData) {

}

database.updateUserSettings = function(user_uid, user_settings, callback) {

}

database.getAllEntriesForUser = function(uid, onlyIds, callback) {

}

database.getEntriesFromEntry = function(uid, start_eid, num, callback) {

};

database.getXEntriesByUser = function(uid, eid, number, callback) {

};

// callback is passed true or false depending on whether the user exists.
database.checkForUser = function(user_uid, callback, data) {

}

// entry = {
//   eid: '',
//   uid: '',
//   datetime: '',
// 	 text: '',
//   oldtext: '',
//   deleted: false,
//   location: [lat, long]?
// }

/***************	Diary Entries	***************/
database.getEntry = function(entryid, callback) {
  if (callback == undefined) {
    return r.table('entries').get(entryid).run();
  } else {
    r.table('entries').get(entryid).run().then((result) => {
      callback(result);
    })
  }
}

database.getEntryRange = function(uid, from, to, callback) {
  if (callback == undefined) {
    return r.table('entries').filter(r.and(
      r.row("datetime").lt(to),
      r.row("datetime").gt(from),
      r.row("uid").eq(uid)
    )).orderBy('datetime').run();
  } else {
    r.table('entries').filter(r.and(
      r.row("datetime").lt(to),
      r.row("datetime").gt(from),
      r.row("uid").eq(uid)
    )).orderBy('datetime')
    .run().then((result) => {
      callback(result);
    });
  }
}

database.updateEntry = function(entryid, entry_object, callback) {
  var next;
  if (callback == undefined) {
    return r.table('entries').get(entryid).run().then(result => {
      next = result;
      next.oldtext = next.text;
      next.text = entry_object.text;
      return r.table('entries').get(entryid).update(next).run();
    }).then(() => {
      return new Promise(function(resolve, reject) {
        resolve(next);
      })
    });
  } else {
    r.table('entries').get(entryid).run().then(result => {
      next = result;
      next.oldtext = next.text;
      next.text = entry_object.text;
      return r.table('entries').get(entryid).update(next).run();
    }).then(() => {
      callback(next);
    });
  }
}

database.makeEntry = function(entry_object, callback) {
  if (callback == undefined) {
    return r.table('entries').insert(entry_object).run().then(result => {
      return new Promise(function(resolve, reject) {
        resolve(result.generated_keys[0]);
      })
    });
  } else {
    r.table('entries').insert(entry_object).run().then(result => {
      callback(result.generated_keys[0]);
    })
  }
}

database.removeEntry = function(entryid, callback) {
  if (callback == undefined) {
    return r.table('entries').get(entryid).delete().run();
  } else {
    r.table('entries').get(entryid).delete().run().then(result => {
      callback(result);
    })
  }
}

// Used to ensure the entry is valid
var verifyEntry = function(entry_object) {

}

exports = module.exports = database;
