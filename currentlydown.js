/**
 *    Author: Michael
 *    This is an app to run on the tg.sh app and let people
 *    know that we're currently down. It does like nothing else
 *
*/

require('colors')
var tg = require('./tg').start()

/* *********************************************************************
      Listeners
*/

tg.event.on('started', function (d) {
  console.log('yo, this dawg is kicking')
})

tg.event.on('newmessage', function (m) {
  console.log('-------------------------------------'.magenta)
  console.log(('we got a message from ' + m.from.first_name).cyan)
  console.log('BUT. We\'re on hiatus so we can\'t respond'.magenta)

  // Maybe offer to store someone's names and tell them when we're back up? idk.
  tg.send(m.from.print_name, 'Hi there! Sorry but this service is ' +
    'currently down or getting awesome new features! Apologies for not being a working diary atm. Checkback later')
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
