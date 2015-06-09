/**
 *		Author: Michael
 *		1 Sentence Diary implementation using node and telegram
 *
*/

var _ = require('lodash') // libary just incase.
var mongo = require('mongojs')
var mongoURI = require('./mongoKey')
var tg = require('./tg').start()

// mongodb://<dbuser>:<dbpassword>@ds034878.mongolab.com:34878/sentence-diary

var db = mongo(mongoURI, ['entries', 'users'])

tg.event.on('newmessage', function (d) {
	console.log('-------------------------------------'.magenta)
	console.log('we got a message from '+d.from.first_name+' saying "'+d.text+'"')

	db.entries.insert({
		text: d.text
	  , user: d.from.phone
	  , date: +new Date
	})
	tg.send(d.print_name, 'Just received a message from you saying: "'+d.text+'"')
})
