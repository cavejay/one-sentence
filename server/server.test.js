var make_session = require('./server').testing.make_session;
var getSessionExpiry = require('./server').testing.getSessionExpiry;
var getLoggedIn = require('./server').testing.logged_in;
var db = require('./lib/database');
var app = require('./server').testing.server;
var assert = require('chai').assert;
var request = require('supertest');
var utils = require('./lib/testUtils');

describe('-- User accounts --', function () {
  describe('/user/new', function () {
    before(utils.beforeEach);
    after(utils.afterEach);

    it('creates a user successfully', (done) => {
      db.init().then(() => {
        request(app)
        .post('/user/new')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
      });
    });
    it('returns the correct response');
    it('doesn\'t allow creation of duplicate users');
    it('doesn\'t allow creation of invalid usernames');
  })
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
      assert.notEqual(getLoggedIn()['hi'], undefined, 'array contains value');
    });
  });

  describe('getSessionExpiry', function () {
    it('correctly decodes the session from a uid');
  });
});
