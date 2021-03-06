// This file is for constants if we have any.

exports.helpStrings = {
  '<help>': 'Send your diary sentences to this account and we will store them for you! ' +
						'Other commands include: <removeAllData>, <reminder>, <generateview>, <stats> and <date>. ' +
						'In order to see what they do send both <help> and a command in a message. For ' +
						'example: "<help> <generateview>" would give help about the <generateview> command.',
  '<removealldata>': 'NOT CURRENTLY IMPLEMENTED. ' +
						'Permanently removes all of the data relating to you from the server.' +
						' There is no way to get it back, it will be gone forever. Legit.' +
						' The previous sentences only apply if I\'ve not taken any sneaky backups.',
  '<generateview>': 'NOT CURRENTLY IMPLEMENTED. ' +
						'Generates a webpage to view your diary entries on. A new webpage is created for ' +
						'you each time with a random URL that is then sent to you.',
  '<stats>': 'NOT CURRENTLY IMPLEMENTED. ' +
						'Returns a brief message that includes interesting stats on your use of the diary',
  '<date>': 'NOT CURRENTLY IMPLEMENTED. ' +
						'Overrides the date you sent the message with the date immediately following ' +
						'the command. Dates must be in the format YYYYMMDD. For example: "<date> 20150722" ' +
						'if the string following the command isnt a proper date a message will be returned ' +
						'informing you of the failure',
  '<reminder>': 'Sends a reminder message if you\'ve not entered your daily entry before a ' +
            'specified time. Proper use is \"<reminder> 2200\" which would send a reminder ' +
            'message at 10pm if you had not already made an entry. Sending only \"<reminder>\" ' +
            'removes the reminder notive from your account'
}

exports.welcomeMessage = 'Hello & welcome new user to the Daily Commit-Log Sentence Diary (The name is un-confirmed atm). '+
		'Your first message will be ignored so you should send it again if it was an entry!'+
		" Available commands can be found by sending '<help>' in a message to this account."+
		" This software is currently still pre-alpha so Please be aware that your data cannot be guranteed safety"

module.exports = exports
