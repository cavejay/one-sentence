var scheduler = require('node-schedule')

data = {
  currentlyReminding: [],
  scheduler: null,
  addUser: function addUser (userid) {
    if(!currentlyReminding.indexOf(userid)) {
      currentlyReminding.push(userid)
      // init their scheduler
      return true
    } else {
      return false
    }
  },

  removeUser: function removeUser (userid) {
    if(currentlyReminding.indexOf(userid)) {
      currentlyReminding.splice(currentlyReminding.indexOf(userid),1)
      // cancel their schedule
      return true
    } else {
      return false
    }
  }
}

module.exports = function startReminders(db, send) {
  db.users.find({}, function (err, docs) { // Add all users with current reminders
    docs.forEach(function (doc) {
      if (doc.reminder) {
        data.currentlyReminding.push({userid: doc.userid, time: doc.reminder})
      }
    })

    // Then we start the schedules for each of them with another forEach
    data.currentlyReminding.forEach(function (user) {
      user.job = schedule.scheduleJob('* * * * * 15,30,45', function() {
        send(user.print_name, "it's that time again")// Send the message
      });
    });
  })

  return data
}
