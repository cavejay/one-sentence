var scheduler = require('node-schedule');
var db = require('./db.js');

var data = {
  currentlyReminding: [],
  scheduler: null
};

data.addUser = function addUser (userid) {
  if (!this.currentlyReminding.indexOf(userid)) {
    this.currentlyReminding.push(userid);
    // init their scheduler
    return true;
  } else {
    return false;
  }
};

data.removeUser = function removeUser (userid) {
  if (this.currentlyReminding.indexOf(userid)) {
    this.currentlyReminding.splice(this.currentlyReminding.indexOf(userid), 1);
    // cancel their schedule
    return true;
  } else {
    return false;
  }
};

data.setReminder = function setReminder (userid, reminderState, cb) {

};

module.exports = function startReminders (db, send) {
  db.db.users.find({}, function (err, docs) { // Add all users with current reminders
    docs.forEach(function (doc) {
      if (doc.reminder) {
        data.currentlyReminding.push({userid: doc.userid, time: doc.reminder});
      }
    });

    // Then we start the schedules for each of them with another forEach
    data.currentlyReminding.forEach(function (user) {
      user.job = scheduler.scheduleJob('* * * * * 15,30,45', function () {
        send(user.print_name, "it's that time again"); // Send the message
      });
    });
  });

  return data;
};
