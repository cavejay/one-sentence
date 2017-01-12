var db = require('./lib/database');
var expect = require('chai').expect;
var request = require('supertest');
var utils = require('./lib/testUtils');

var make_session = require('./server').testing.make_session;
var getSessionExpiry = require('./server').testing.getSessionExpiry;
var getLoggedIn = require('./server').testing.logged_in;
var app = require('./server').testing.server;


describe('-- User accounts --', function () {
  describe('user/check', function () {
    before(utils.beforeEach);
    after(utils.afterEach);

    var user1 = {username: 'tester1', first: 'First', last: 'Last', pwhash: 'pwlol95'};
    it('requires athentication', (done) => { // This might need some re-work?
      request(app)
        .get('/user/check')
        .expect(401, done);
    });

    it('reports correctly if the user exists', (done) => {
      db.r.tableCreate('users').run().then(() => {
          return db.makeUser(user1.username, user1.first, user1.last, user1.pwhash);
      }).then(() => {
        request(app)
          .get('/user/check')
          .set('pw', require('./pw'))
          .set('username', 'tester1')
          .expect(200)
          .expect('exists', 'false')
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body).to.be.empty;
            return done();
          });
      });
    });

    it('reports correctly if a user doesn\'t exist', (done) => {
      db.r.tableCreate('users').run().then(() => {
        request(app)
        .get('/user/check')
        .set('pw', require('./pw'))
        .set('username', 'testerNotThere')
        .expect(200)
        .expect('exists', 'false')
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.be.empty;
          return done();
        });
      });
    });

    it('reports correctly when used with malformed data', (done) => {
      db.r.tableCreate('users').run().then(() => {
        request(app)
          .get('/user/check')
          .set('pw', require('./pw'))
          .send({username: 213213, name: 'tester1'})
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.message).to.equal('A \'username\' header is required for this endpoint');
            return done();
          });
      });
    });
  });

  describe('/user/new', function () {
    before(utils.beforeEach);
    after(utils.afterEach);

    it('creates a user successfully', done => {
      db.r.tableCreate('users').run().then(() => {
        request(app)
          .post('/user/new')
          .set('pw', require('./pw'))
          .set('Accept', 'application/json')
          .send({
            username: 'cavejay',
            pw: 'ThisIsPassword12',
            email: 'HI@hi.com',
            name: 'Michael X'
          })
          .expect(201)
          .end((err, res) => {
            if (err) return done(err);
            if (res.body.uid === undefined) return;
            db.checkForUser(res.body.uid).then(result => {
              expect(result).to.be.true;
              return done();
            });
          });
      });
    });

    it('doesn\'t allow creation of duplicate users', done => {
      db.r.tableCreate('users').run().then(() => {
        request(app)
          .post('/user/new')
          .set('pw', require('./pw'))
          .set('Accept', 'application/json')
          .send({
            username: 'cavejay',
            pw: 'ThisIsPassword12',
            email: 'HI@hi.com',
            name: 'Michael X'
          })
          .expect(201)
          .end((err, res) => {
            if (err) return done(err);

            // Make a new request for the same user
            request(app)
              .post('/user/new')
              .set('pw', require('./pw'))
              .set('Accept', 'application/json')
              .send({
                username: 'cavejay',
                pw: 'ThisIsPassword12',
                email: 'HI@hi.com',
                name: 'Michael X'
              })
              .expect(422)
              .end((err2, res2) => {
                if (err2) return done(err2);
                if (res2.body.code == 'ForbiddenError' &&
                    res2.body.message == 'Username already exists') {
                  done();
                }
              });
          });
      });
    });

    it('catches invalid emails', done => {
      db.r.tableCreate('users').run().then(() => {
        request(app)
          .post('/user/new')
          .set('pw', require('./pw'))
          .set('Accept', 'application/json')
          .send({
            username: 'cavejay',
            pw: 'ThisIsPassword12',
            email: 'HIcom',
            name: 'Michael X'
          })
          .expect(422)
          .end((err, res) => {
            if (err) return done(err);
            if (res.body.code == 'ForbiddenError' &&
                res.body.message == 'Email is invalid') {
              done();
            }
          });
      });
    });

    it('catches inadequate passwords', done => {
      db.r.tableCreate('users').run().then(() => {
        request(app)
          .post('/user/new')
          .set('pw', require('./pw'))
          .set('Accept', 'application/json')
          .send({
            username: 'cavejay',
            pw: 'adf dsaf adsf',
            email: 'HI@hi.com',
            name: 'Michael X'
          })
          .expect(422)
          .end((err, res) => {
            if (err) return done(err);
            if (res.body.code == 'ForbiddenError' &&
                res.body.message == 'Password doesn\'t meet requirements') {
              done();
            }
          });
      });
    });

    it('catches invalid usernames 1', done => {
      db.r.tableCreate('users').run().then(() => {
        request(app)
          .post('/user/new')
          .set('pw', require('./pw'))
          .set('Accept', 'application/json')
          .send({
            username: 'cavejay !@#?~',
            pw: 'ThisIsPassword12',
            email: 'HI@hi.com',
            name: 'Michael X'
          })
          .expect(422)
          .end((err, res) => {
            if (err) return done(err);
            if (res.body.code == 'ForbiddenError' &&
                res.body.message == 'Username is invalid') {
              done();
            }
          });
      });
    });
    it('catches invalid usernames 2');
    it('catches invalid usernames 3');
    it('catches invalid usernames 4');
  });

  describe('/user/update', function () {
    it('doesn\'t update users that don\'t exist');
    it('updates only the part of the user that\'s relevant');
    it('catches invalid emails');
    it('prevents changing of username');
    it('doesn\'t add fields that shouldn\'t exist to the user');
    it('doesn\'t change data when it something fails');
  });

  describe('/user/delete', function () {
    it('removes the user info');
    it('removes all of the user\'s entries from the database');
    it('frees up the deleted users username for reuse');
  });

  describe('/user/fetch/:uid')
});

describe('-- User Diary Entries --', function () {
  describe('/user/:uid/create', function () {
    it('creates the right database entry');
    it('returns the correct response');
    it('returns the right error response to bad input');
  });
});

// for tests.
describe('-- helper functions --', function () {
  describe('make_session', function () {
    it('correctly stores a sessionID and uid', () => {
      make_session('hi');
      expect(getLoggedIn()['hi'], 'array contains value').to.not.equal(undefined);
    });
  });

  describe('getSessionExpiry', function () {
    it('correctly decodes the session from a uid');
  });
});
