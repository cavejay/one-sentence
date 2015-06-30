var spawn 	 	 = require('child_process').spawn
  , stripAns 	 = require('strip-ansi')
  , EventEmitter = require('events').EventEmitter
  , tgsh 		 = spawn('./tg.sh')
  , colors 		 = require('colors')

function tg() {

}

// A method
tg.start = function () {
	this.write('').write('dialog_list')
	return this
}

tg.sh = tgsh

tg.close = function () {
  this.write('safe_quit')
  tgsh.kill()
}

tg.event = new EventEmitter()

// This does actually send texts!
tg.send = function (contact, str) {
	tgsh.stdin.write('msg ' + contact + ' ' + str+'\n')
	return this
}

tg.write = function (str) {
	tgsh.stdin.write(str+'\n')
	return this
}

tg.addContact = function(phone, firstName, LastName) {
	this.write('add_contact ')
  return this
}

tg.raw = []


// Handle the output of tgcli
tgsh.stdout.on('data', function(buffer) {
	// console.log('wegotdataaswell'.cyan)
	var lines = buffer.toString().split('\n').filter(Boolean)

	// Check if we just started up and handle the beautiful text.
	// TODO: Pass this through to stdout to preserve cpright?
	if (lines[0] == "Telegram-cli version 1.3.1, Copyright (C) 2013-2015 Vitaly Valtman") {
		tg.event.emit('started')
    // console.log('wegothere'.green)

  } else if (lines[0].split(" ")[0] == 'User') {
    // We just got told a user read a message. We don't /really/ car about this.
    var tmp = lines[0].split(" ")
    print_name = tmp[1]+'_'+tmp[2]

    // We'll emit an event with the user's name.
    tg.event.emit('readReceipt', print_name)

  } else if (lines.length > 5) {
    tg.event.emit('longMessage', lines)

  // Every other time we do this:
  }	else {

		// Dev stuff.
		// console.log('lines: '.red + lines.length.toString().red)
		// tg.raw.push(lines)
		// console.log(lines.toString().green)

		// Usually the important stuff is here
		var msg = ''

		// If we just sent a message we'll get stars though, so catch that
		if(lines[0].trim().split(' ')[0] == '***') {
      var msg = undefined
			lines.forEach(function (l) {
        if (l.trim().split(' ')[0] !== '***') msg = l
      })
      // parse it
      if (msg === undefined) {
        tg.event.emit('unknownString', lines)
        return
      }
			msg = JSON.parse(msg)

		} else {
      try {
        msg = JSON.parse(lines[0])
      }
      catch(e) {
        tg.event.emit('unknownString', lines)
        return
      }
		}

		// Was the msg about a message?
		if ('text' in msg) {

			// console.log("We received a ".red + msg.event.toString().red + ' event'.red)

			// Was it to us?
			if(msg.to.username == "sentencediary") {
				// console.log('It was to us')
				tg.event.emit('newmessage', msg)
			}

			// Was it from us?
			if(msg.from.username == "sentencediary") {
				// console.log('It was from us')
				tg.event.emit('sentmessage', msg)
			}

		} else {
      tg.event.emit('other', msg)
    }
	}
})



exports = module.exports = tg
