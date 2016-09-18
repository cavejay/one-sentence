var restify = require('restify'),
		fs 			= require('fs'), // needed for cert and key of server (if https)
		db 	= require('./lib/database.js');
    log = require('./lib/log.js');

var server = restify.createServer({
	// certificate: fs.readFileSync('path/to/cert'),
	// key: fs.readFileSync('path/to/key'),
	name: 'one-sentence-server',
});

server.use(restify.acceptParser(server.acceptable));

server.listen(9090, function () {
	log.a('%s listening at %s', server.name, server.url);
});

function send (req, res, next) {
	res.send('hello '+req.params.name);
	return next();
}

/***************		Variables		***************/

var logged_in = {};

/***************		Login Checker		***************/

server.use(function (req, res, next) {
  if (req.header('pw') != require('./pw')) {
    res.send(400, 'Password incorrect');
    return next(false);
  }
  return next();
});
/*
server.use(function (req, res, next) {
  var session = logged_in[req.header('session-token')];

  // Check if we have a session
  if (session == undefined) {
    // if we don't have a session then check for the user
    db.checkForUser(req.header('uid')).then(userExists => {
      if (userExists) {
        log.session('new user session started for ', req.header('uid'));
        make_session(req.header('uid'));
        return next();
      } else {
        log.session('unknown user %s attempted to use the service', req.header('uid'));
        res.send(401, "User not found");
        return next(false);
      }
    });
  } else if (getSessionExpiry(session) > new Date.getTime()) {
    // User has an old session and needs to generate a new one
    db.verifyUser(req.header('uid')).then(res => { // todo make this a log in?
      if (res) {
        make_session(req.header('uid'));
        return next();
      } else {
        res.send(401, 'Password incorrect'); // xxx this wont happen ever atm
        return next(false);
      }
    });
  } else {
    // we have a current, valid session
    return next();
  }
});
*/
/*************** 		Diary endpoints		***************/

// Make a new diary entry
server.post('/diaryentry/user/:uid/create', function (req, res, next) {
	log.api('recieved a new entry for %s', req.params.uid);
  // make new entry
  // return response
	res.send(200, "received a new diary entry for " + req.params.uid);
	return next();
});

// Get a diary entry
server.get('/diaryentry/user/:uid/fetch/:entryid', function (req, res, next) {
	log.api('fetch for entry %s by %s', req.params.entryid, req.params.uid);
	res.send(200, "received a GET for a diary entry '" + req.params.entryid + "' for "+ req.params.uid);
	return next();
});

// Get entries between 2 dates
server.get('/diaryentry/user/:uid/fetch/:date1/to/:date2', function (req, res, next) {
  log.api('fetch for entries by %s from %s to %s', req.params.uid, req.params.date1, req.params.date2);
  res.send(200, "recieved a GET for a range of entries");
  return next();
});

// Get all entries for user
server.get('/diaryentry/user/:uid/fetch/', function (req, res, next) {
  log.api('fetch for all entries by %s', req.params.uid, req.params.date1, req.params.date2);
  res.send(200, "recieved a GET for all entries");
  return next();
});

// Update a diary entry
server.put('/diaryentry/user/:uid/update/:entryid', function (req, res, next) {
	log.api('update for %s by %s', req.params.entryid, req.params.uid);
	res.send(200, "recieved a put for a diary entry");
});

// Remove a diary entry
server.del('/diaryentry/user/:uid/remove/:entryid', function (req, res, next) {
	log.api('delete for %s by %s', req.params.entryid, req.params.uid);
	res.send(200, "received a delete for a diary entry");
	return next();
});

/*************** 		User endpoints		***************/

// Make a new user
server.post('/user/new', function (req, res, next) {
  log.api('create a new user called %s', req.params.suggestedusername);

  res.send(200, "received a request to make a new user called" + req.params.suggestedusername);
  return next();
});

// login to a user
server.get('/login/:uid', function (req, res, next) {
	// If there was no current session
	if (!logged_in[req.params.uid]) {

		// make a new session
		make_session(req.params.uid);

		log.a(req.params.uid + ' did not have a current session. a new session was created with ID: '+logged_in[req.params.uid]);
	} else {
    // return session id
    res.send(200, 'session_ID: ' + logged_in[req.params.uid]);
  }

	return next();
});

/***************		Utility Functions		***************/

var make_session = function (uid) {
  var expirytime = new Date().getTime() + 30*60*60;
	var sessionID = Math.floor((Math.random() * 100 * Math.random() * 1927473824) + 1);
  sessionID = ((sessionID << 15 + expirytime) * 31 + 1201) * 7;
  // http://security.stackexchange.com/questions/24850/choosing-a-session-id-algorithm-for-a-client-server-relationship
  logged_in[uid] = sessionID;
	logged_in[sessionID] = uid;
  return sessionID;
}

var getSessionExpiry = function (uid) {
  var sessionID = logged_in[uid];
  sessionID = ((sessionID/7) - 1201)/31;
  return sessionID && 32767;
}

module.exports.testing = {};
module.exports.testing.getSessionExpiry = getSessionExpiry;
module.exports.testing.make_session = make_session;
module.exports.testing.server = server;
module.exports.testing.logged_in = () => {return logged_in};
exports = module.exports;
