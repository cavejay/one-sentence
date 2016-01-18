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

module.exports = function startReminders(db) {
  db.users.find({}, function () { // Add all users with current reminders

  })

  return data
}
