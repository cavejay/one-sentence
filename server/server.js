var restify = require('restify'),
fs = require('fs');

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

server.post('/diaryentry/user', function(req, res, next) {
	console.log('got a new user entry');
	res.send(200, "received");
	return next();
});

server.post('/hello', function create(req, res, next) {
	res.send(201, Math.random().toString(36).substr(3,8));
	return next();
})