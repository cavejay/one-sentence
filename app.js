/**
 *    Author: Michael
 *    1 Sentence Diary implementation using node and telegram
 *
*/

var _ = require('lodash') // libary just incase.
var mongo = require('mongojs')
// var colors = require('colors')
var argv = require('minimist')(process.argv.slice(2))
var schedule = require('node-schedule');

if (!argv.debug) {
  var mongoURI = require('./mongoKey')
  var tg = require('./tg').start()
}
var statics = require('./lib/statics')

// mongodb://<dbuser>:<dbpassword>@ds034878.mongolab.com:34878/sentence-diary

var db = mongo(mongoURI, ['entries', 'users'])

var reminders = require('reminders')(db) // Start reminders for all users

/* *********************************************************************
      Commands
*/

var ErrorMsg = function ErrorMsg (str) {
  tg.send(msg.from.print_name,
   'Detected too many or invalid words in your <' + str + '> command. ' +
   'Use \"<help> <' + str + '> for more detail\"');
}

var FailMsg = function FailMsg (str) {
  tg.send(msg.from.print_name,
   'Your <' + str + '> command failed to run for some reason.' +
   'Please try again or log an issue on this project\'s github page.')
}

var keywords = {
  '<help>': function helpCommand (msg) {
    var str = 'Send your diary sentences to this account and we will store them for you! ' +
              'Other commands include: <removeAllData>, <generateview>, <stats> and <date>. ' +
              'In order to see what they do send both <help> and a command in a message. For ' +
              'example: "<help> <generateview>" would give help about the <generateview> command.'
    tg.send(msg.from.print_name, str)
  },
  '<removealldata>': function (msg) {
    var str = 'NOT CURRENTLY IMPLEMENTED. '
    tg.send(msg.from.print_name, str)
  },
  '<generateview>': function (msg) {
    var str = 'NOT CURRENTLY IMPLEMENTED. '
    tg.send(msg.from.print_name, str)
  },
  '<stats>': function (msg) {
    var str = 'NOT CURRENTLY IMPLEMENTED. '
    tg.send(msg.from.print_name, str)
  },
  '<date>': function (msg) {
    var str = 'NOT CURRENTLY IMPLEMENTED. '
    tg.send(msg.from.print_name, str)
  },
  '<reminder>': function reminderCommand (msg) {
    // Validate the message
    var words = msg.text.split(' ')
    var time = (words[0] == '<reminder>') ? words[1] : words[0] // only expecting 2 words

    // Check that time is a number
    if (isNaN(time)) return ErrorMsg('reminder')

    time = parseInt(time) // convert to time number
    if (~~(time/100) >= 24 || time - (~~(time/100) * 100) >= 60) // ensure that it's a valid 24hour time
    time = new Date(0,0,0, ~~(time/100), time-(~~(time/100)*100))

    // Do the stuff
    switch (words.length) {
      case 1: // Reset a time
        setReminderForUser(msg.from.id, false, function(err) {
          if (!err) tg.send(msg.from.print_name, 'You have disabled daily reminders');
          else FailMsg('reminder')
        })
        break
      case 2: // Included a time
        setReminderForUser(msg.from.id, time, function(err) {
          if (!err) tg.send(msg.from.print_name, 'You will now be reminded at '+time.getHours()+':'+time.getMinutes()+
          ' each day. To remove this reminder send \"<reminder>\" as a message.')
          else FailMsg('reminder');
        })
        break
      default:
         return ErrorMsg('reminder')
    }
  }
}

/* *********************************************************************
      Listeners
*/

tg.event.on('started', function (d) {
  console.log('yo, this dawg is kicking')
})

tg.event.on('newmessage', function (m) {
  console.log('-------------------------------------'.magenta)
  console.log(('we got a message from ' + m.from.first_name).cyan)

  // Check if a new user here TODO
  // Check user id against those in db and then send welcome message if not there
  // Then return early
  getUserFromDatabase(m.from.id, function (err, doc) {
    if (err) console.err('Ran into an error when checking if user exists')
    if (!doc) { // This is a new user
      addUserToDatabase(m.from.id);
      tg.send(m.from.print_name, 'Hi! Welcome to Cavejay\'s Single Sentence Diary Implementation. ' +
        ' Type \"<help>\" to get started!')
    }
  })

  // Check for keywords&commands
  var words = m.text.replace('.', ' ').split(' ')
  var caughtCommands = []

  words.forEach(function (word) {
    if (word.toLowerCase() in keywords) caughtCommands.push(word.toLowerCase())
  })
  console.log('The following commands were caught:\n' + caughtCommands)

  // There was nothing so this must be a diary entry
  if (caughtCommands.length === 0) { // No commands
    addToDatabase(m.from.id, m.text, +new Date)

    // Strip the white space. It'll kill the message
    m.text = m.text.replace(/\r?\n|\r/g, ' ')
    tg.send(m.from.print_name, 'A new diary entry was added saying: "' + m.text + '"')

  // We caught a specific help command
  } else if (caughtCommands.length === 2 && caughtCommands.indexOf('<help>') >= 0) {
    // Find out what the other command is and send it's help message back.
    var helpPos = caughtCommands.indexOf('<help>')
    var otherCommandPos = (helpPos === 0) ? 1 : 0
    console.log('returning help message for ' + caughtCommands[otherCommandPos])
    tg.send(m.from.print_name, statics.helpStrings[caughtCommands[otherCommandPos]])

  // We caught a single command and are running it
  } else if (caughtCommands.length === 1) { // run the first command
    // run the commands function
    keywords[caughtCommands[0]](m)

  // Incase they went nuts with the commands nothing happens and they get a note.
  } else {
    tg.send(m.from.print_name, 'Too many commands were detected. ' +
    'Please only send 1, or 2 when using the <help> command')
  }

})

tg.event.on('longMessage', function (d) {
  console.log('We got a long message:'.cyan)
  console.log(d)
})

tg.event.on('unknownString', function (d) {
  console.log('Caught an unknown string'.red)
  console.log(d)
})

tg.event.on('sentmessage', function (d) {
  console.log('A message was sent'.cyan)
})

tg.event.on('other', function (d) {
  console.log('Someother type of message was caught'.cyan)
  console.log(d)
})

tg.event.on('readReceipt', function (d) {
  console.log('User '.cyan + d.toString().cyan + ' just triggered a read receipt'.cyan)
})

process.stdin.on('readable', function () {
  var chunk = process.stdin.read()
  if (chunk !== null) {
    process.stdout.write('sending: "' + chunk.toString().trim() + '"\n')
    tg.write(chunk.toString().trim())
  }
})

process.on('exit', function (code) {
  tg.close()
})

/* *************************************************************************
      Functions
*/

/* Blindly add a new user to the db */
var addUserToDatabase = function addUserToDatabase (id) {
  db.users.insert({
    userid: id,
    reminder: false
  })
}

/* State must be either a time or false */
var setReminderForUser = function setReminderForUser (id, time, cb) {
  db.users.findAndModify({
    query: {userid: id},
    update: {$set: {reminder: time}},
    new: true
  }, function (err, doc, lastErrorObject) {
    if (err) console.err('Couldn\'t update the db')
    cb(err)
  });
}

/* return a user's information */
var getUserFromDatabase = function getUserFromDatabase (id, cb) {
  db.users.findOne({userid: id}, cb)
}

/* Add an entry to the db */
var addToDatabase = function addToDatabase (id, text, date) {
  // Pull information about user using id and user collection here

  // Encrypt the user's information here

  // Send the diary entry here
  db.entries.insert({
    text: text,
    user: id,
    date: date
  })
}
