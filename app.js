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
require('./statics')

// mongodb://<dbuser>:<dbpassword>@ds034878.mongolab.com:34878/sentence-diary

var db = mongo(mongoURI, ['entries', 'users'])

/**********************************************************************
			Commands
*/

var keywords = {
	'<help>': function(msg) {
		var str = 'Send your diary sentences to this account and we will store them for you! '+
							'Other commands include: <removeAllData>, <generateview>, <stats> and <date>. '+
							'In order to see what they do send both <help> and a command in a message. For '+
							'example: "<help> <generateview>" would give help about the <generateview> command.'
		tg.send(msg.from.print_name, str)
	}
, '<removealldata>':function(msg) {
	var str = 'NOT CURRENTLY IMPLEMENTED. '
	tg.send(msg.from.print_name, str)
}
, '<generateview>':function(msg) {
	var str = 'NOT CURRENTLY IMPLEMENTED. '
	tg.send(msg.from.print_name, str)
}
, '<stats>':function(msg) {
	var str = 'NOT CURRENTLY IMPLEMENTED. '
	tg.send(msg.from.print_name, str)
}
, '<date>':function(msg) {
	var str = 'NOT CURRENTLY IMPLEMENTED. '
	tg.send(msg.from.print_name, str)
}}

/**********************************************************************
			Listeners
*/

tg.event.on('started', function (d) {
	console.log('yo, this dawg is kicking')
})

tg.event.on('newmessage', function (m) {
	console.log('-------------------------------------'.magenta)
	console.log(('we got a message from '+m.from.first_name+' saying "'+m.text+'"').cyan)

	//Check for keywords
	var words = m.text.replace('.',' ').split(" "),
			caughtCommands = []

	words.forEach(function(word) {
		if (word in keywords) caughtCommands.push(word);
	})

	if (caughtCommands.length==0) addToDatabase(m.from.id, m.text, +new Date);
	else if(caughtCommands.length==1 && caughtCommands[0]=='<help>'){
		console.log('The following commands were caught:\n'+caughtCommands)
		// run the commands function
		keywords[caughtCommands[0]](m)
	}

	// Strip the white space. It'll kill the message
	m.text = m.text.replace(/\r?\n|\r/g, ' ')
	tg.send(m.from.print_name, 'Just received a message from you saying: "'+m.text+'"')
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

process.on('exit', function(code) {
	tg.close()
})

/**************************************************************************
			Functions
*/

addToDatabase = function (id, text, date) {
	db.entries.insert({
		text: text
	, user: id
	, date: date
	})
}
