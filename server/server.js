var restify = require('restify'),
		fs 			= require('fs'),
		db 	= require('./lib/database.js');

var server = restify.createServer({
	// certificate: fs.readFileSync('path/to/cert'),
	// key: fs.readFileSync('path/to/key'),
	name: 'one-sentence-server',
});

server.use(restify.acceptParser(server.acceptable));

server.listen(8080, function() {
	console.log('%s listening at %s', server.name, server.url);
});

function send(req, res, next) {
	res.send('hello '+req.params.name);
	return next();
}

/*************** 		Singular Diary Entry		***************/

server.post('/diaryentry/user/:uid', function(req, res, next) {
	console.log('got a new user entry');
	res.send(200, "received a new diary entry for " + req.params.uid);
	return next();
});

server.get('/diaryentry/user/:uid/:entryid', function(req, res, next) {
	console.log('got an access to a user entry');
	res.send(200, "received a get for a diary entry '" + req.params.entryid + "' for "+ req.params.uid);
	return next();
});

server.put('/diaryentry/user/:uid/:entryid', function(req, res, next) {
	console.log('got an update for a user entry');
	res.send(200, "recieved a put for a diary entry");
});

server.del('/diaryentry/user/:uid/:entryid', function(req, res, next) {
	console.log('got a delete request for a user entry');
	res.send(200, "received a delete for a diary entry");
	return next();
});

server.get('/login', function(req, res, next) {
	console.log('got a login request');
	res.send(200, 'recieved a login request');
	return next();
})

server.post('/hello', function create(req, res, next) {
	res.send(201, Math.random().toString(36).substr(3,8));
	return next();
})
