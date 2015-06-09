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
}

tg.raw = []

tgsh.stdout.on('data', function(buffer) {
	// console.log('wegotdataaswell'.cyan)
	var lines = buffer.toString().split('\n').filter(Boolean)

	// Check if we just started up and handle the beautiful text.
	// TODO: Pass this through to stdout to preserve cpright?
	if (lines[0] == "Telegram-cli version 1.3.1, Copyright (C) 2013-2015 Vitaly Valtman") {
		// console.log('wegothere'.green) 
	
	// Every other time we do this:
	} else {

		// Dev stuff.
		console.log('lines: '.red + lines.length.toString().blue)
		tg.raw.push(lines)
		console.log(lines)

		// Usually the important stuff is here
		var msg = ''

		// If we just sent a message we'll get stars though, so catch that
		if(lines[0].trim().split(' ')[0] == '***') {
			// parse it
			msg = JSON.parse(lines[1])

		} else {
			msg = JSON.parse(lines[0])
		}

		// Was the msg about a message?
		if (msg.event == 'message') {

			console.log("We received a ".red + msg.event.toString().red + ' event'.red)
			
			// Was it to us?
			if(msg.to.username == "sentencediary") {
				console.log('It was to us')
				tg.event.emit('newmessage', msg)
			}

			// Was it from us?
			if(msg.from.username == "sentencediary") {
				console.log('It was from us')
				tg.event.emit('sentmessage', msg)
			}

		}
	}
})



exports = module.exports = tg
