/**
 *		Author: Michael
 *		1 Sentence Diary implementation using node and telegram
 *
*/

var _ = require('lodash') // libary just incase.
var mongo = require('mongojs')
var mongoURI = require('./mongoKey')
var colors = require('colors')
var tg = require('./tg').start()

// mongodb://<dbuser>:<dbpassword>@ds034878.mongolab.com:34878/sentence-diary

var db = mongo(mongoURI, ['entries', 'users'])

/**********************************************************************
			Listeners
*/

tg.event.on('started', function (d) {
	console.log('yo, this dawg is kicking')
})

tg.event.on('newmessage', function (d) {
	console.log('-------------------------------------'.magenta)
	console.log(('we got a message from '+d.from.first_name+' saying "'+d.text+'"').cyan)

	db.entries.insert({
		text: d.text
	  , user: d.from.phone
	  , date: +new Date
	})

	// Strip the white space. It'll kill the message
	d.text = d.text.replace(/\r?\n|\r/g, ' ')

	tg.send(d.from.print_name, 'Just received a message from you saying: "'+d.text+'"')
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
	console.log('Someother type of message was caught'.cyan);
	console.log(d)
})

tg.event.on('readReceipt', function (d) {
	console.log('User '.cyan+d.toString().cyan+' just triggered a read receipt'.cyan)
})

process.stdin.on('readable', function() {
	var chunk = process.stdin.read()
	if (chunk !== null) {
		process.stdout.write('sending: "'+chunk.toString().trim()+'"\n')
		tg.write(chunk.toString().trim())
	}
})

/**************************************************************************
			Scripting
*/
