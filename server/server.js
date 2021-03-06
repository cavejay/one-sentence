var restify = require('restify'),
		fs 			= require('fs'),
		db 	= require('./lib/database.js');

var server = restify.createServer({
	// certificate: fs.readFileSync('path/to/cert'),
	// key: fs.readFileSync('path/to/key'),
	name: 'one-sentence-server',
});

server.use(restify.acceptParser(server.acceptable));

server.listen(9090, function() {
	console.log('%s listening at %s', server.name, server.url);
});

function send(req, res, next) {
	res.send('hello '+req.params.name);
	return next();
}

/***************		Variables		***************/

var logged_in = {};


/*************** 		Singular Diary Entry		***************/

// Make a new diary entry
server.post('/diaryentry/user/:uid/create', function(req, res, next) {
	console.log('got a new user entry');
	res.send(200, "received a new diary entry for " + req.params.uid);
	return next();
});

// Get a diary entry
server.get('/diaryentry/user/:uid/:entryid/fetch', function(req, res, next) {
	console.log('got an access to a user entry');
	res.send(200, "received a get for a diary entry '" + req.params.entryid + "' for "+ req.params.uid);
	return next();
});

// Update a diary entry
server.put('/diaryentry/user/:uid/update/:entryid', function(req, res, next) {
	console.log('got an update for a user entry');
	res.send(200, "recieved a put for a diary entry");
});

// Remove a diary entry
server.del('/diaryentry/user/:uid/remove/:entryid', function(req, res, next) {
	console.log('got a delete request for a user entry');
	res.send(200, "received a delete for a diary entry");
	return next();
});

// login to a user
server.get('/login/:uid', function(req, res, next) {

	// If there was no current session
	if(!logged_in[req.params.uid]) {

		// Check the user exists
		db.getUserSettings(req.params.uid, function(data, error) {

		}, req_data(req, res, next));

		// make a new session
		make_session(req.params.uid);

		console.log(req.params.uid + ' did not have a current session. a new session was created with ID: '+logged_in[req.params.uid]);
	}

	// return session id
	res.send(200, 'session_ID: ' + logged_in[req.params.uid]);

	return next();
});

server.post('/hello', function create(req, res, next) {
	res.send(201, Math.random().toString(36).substr(3,8));
	return next();
})

/***************		Utility Functions		***************/

var make_session = function(uid) {
	var seesionID = Math.floor((Math.random() * 1927473824) + 1);
	logged_in[uid] = sessionID;
	logged_in[sessionID] = uid;
}
