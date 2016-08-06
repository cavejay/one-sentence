var restify = require('restify'),
		fs 			= require('fs'), // needed for cert and key of server (if https)
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
	console.log('[API] recieved a new entry for %s', req.params.uid);
  // Check session of user
  // validate body of message
  // make new entry
  // return response
	res.send(200, "received a new diary entry for " + req.params.uid);
	return next();
});

// Get a diary entry
server.get('/diaryentry/user/:uid/fetch/:entryid', function(req, res, next) {
	console.log('[API] fetch for entry %s by %s', req.params.entryid, req.params.uid);
	res.send(200, "received a GET for a diary entry '" + req.params.entryid + "' for "+ req.params.uid);
	return next();
});

server.get('/diaryentry/user/:uid/fetch/:date1/to/:date2', function(req, res, next) {
  console.log('[API] fetch for entries by %s from %s to %s', req.params.uid, req.params.date1, req.params.date2);
  res.send(200, "recieved a GET for a range of entries");
  return next();
});

server.get('/diaryentry/user/:uid/fetch/', function(req, res, next) {
  console.log('[API] fetch for all entries by %s', req.params.uid, req.params.date1, req.params.date2);
  res.send(200, "recieved a GET for all entries");
  return next();
});

// Update a diary entry
server.put('/diaryentry/user/:uid/update/:entryid', function(req, res, next) {
	console.log('[API] update for %s by %s', req.params.entryid, req.params.uid);
	res.send(200, "recieved a put for a diary entry");
});

// Remove a diary entry
server.del('/diaryentry/user/:uid/remove/:entryid', function(req, res, next) {
	console.log('[API] delete for %s by %s', req.params.entryid, req.params.uid);
	res.send(200, "received a delete for a diary entry");
	return next();
});

// login to a user
server.get('/login/:uid', function(req, res, next) {

	// If there was no current session
	if(!logged_in[req.params.uid]) {

		// make a new session
		make_session(req.params.uid);

		console.log(req.params.uid + ' did not have a current session. a new session was created with ID: '+logged_in[req.params.uid]);
	} else {
    // return session id
    res.send(200, 'session_ID: ' + logged_in[req.params.uid]);
  }

	return next();
});

server.get('/hello', function create(req, res, next) {
	res.send(201, make_session(''));
	return next();
})

/***************		Utility Functions		***************/

var make_session = function(uid) {
	var sessionID = Math.floor((Math.random() * 100 * Math.random() * 1927473824) + 1);
  // http://security.stackexchange.com/questions/24850/choosing-a-session-id-algorithm-for-a-client-server-relationship
  logged_in[uid] = sessionID;
	logged_in[sessionID] = uid;
  return sessionID;
}
