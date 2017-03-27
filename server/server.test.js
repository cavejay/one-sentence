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

    var user1 = {username: 'tester1', first: 'First', last: 'Last', email: 'johnny@ives.com', pwhash: 'pwlol95'};
    it('requires athentication', (done) => { // This might need some re-work?
      request(app)
        .get('/user/check')
        .expect(401)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.body.message).to.equal('Provided no authentication');
            return done();
          });
    });

    it('reports correctly if the user exists', (done) => {
      db.r.tableCreate('users').run().then(() => {
          return db.makeUser(user1.username, user1.first, user1.last, user1.email, user1.pwhash);
      }).then(() => {
        request(app)
          .get('/user/check')
          .set('pw', require('./pw'))
          .set('username', user1.username)
          .set('email', user1.email)
          .expect(200)
          .expect('exists', 'true')
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
        .set('email', user1.email)
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
            expect(res.body.message).to.equal('Missing required username header');
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
                expect(res2.body.code).to.equal('UnprocessableEntityError');
                expect(res2.body.message).to.equal('Username already exists');
                return done();
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
            expect(res.body.code).to.equal('UnprocessableEntityError');
            expect(res.body.message).to.equal('Email is invalid');
            return done();
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
            expect(res.body.code).to.equal('UnprocessableEntityError');
            expect(res.body.message).to.equal('Password doesn\'t meet requirements');
            return done();
          });
      });
    });

    it('catches invalid usernames', done => {
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
            expect(res.body.code).to.equal('UnprocessableEntityError');
            expect(res.body.message).to.equal('Username is invalid');
            
            request(app)
              .post('/user/new')
              .set('pw', require('./pw'))
              .set('Accept', 'application/json')
              .send({
                username: 'jimbo.lolcats',
                pw: 'ThisIsPassword42',
                email: 'HI@hi.com',
                name: 'Jimmy JOnes'
              })
              .expect(422)
              .end((err, res) => {
                if (err) return done(err);
                expect(res.body.code).to.equal('UnprocessableEntityError');
                expect(res.body.message).to.equal('Username is invalid');

                request(app)
                  .post('/user/new')
                  .set('pw', require('./pw'))
                  .set('Accept', 'application/json')
                  .send({
                    username: 'xXx_cr@ppyUser_xXx',
                    pw: 'ThisIsPassword12',
                    email: 'HI@hi.com',
                    name: 'Michael X'
                  })
                  .expect(422)
                  .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body.code).to.equal('UnprocessableEntityError');
                    expect(res.body.message).to.equal('Username is invalid');
                    return done();
                  });
              });
          });
      });
    });
  });

  describe('/user/update', function () {
    it('doesn\'t update users that don\'t exist', done => {
      db.r.tableCreate('users').run().then(() => {
        request(app)
          .put('/user/ee7450e0-25f3-4d8a-ad5f-0849d627141c')
          .set('pw', require('./pw'))
          .set('Accept', 'application/json')
          .send({
            email: 'HI@hi.com',
          })
          // .expect(422)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.message).to.equal('User does not exist');
            expect(res.body.code).to.equal('UnprocessableEntityError');
            // make sure the user doesn't actually exist
            db.checkForUser("ee7450e0-25f3-4d8a-ad5f-0849d627141c").then(result => {
              expect(result).to.be.false;
              return done();
            });
          });
      });
    });
    
    it('catches invalid emails', done => {
      db.r.tableCreate('users').run().then(() => {
        return db.makeUser("cavejay", 'foo', 'bar', 'hi@hi.com', '9123jasdkFDf1');
      }).then(uid => {
        request(app)
          .put('/user/'+uid)
          .set('pw', require('./pw'))
          .set('Accept', 'application/json')
          .send({
            email: 'its@a.$cam',
          })
          .expect(422)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.code).to.equal('UnprocessableEntityError');
            expect(res.body.message).to.equal('Email is invalid');
            return done();
          });
      });
    });

    it('processes the data before the uid', done => {
      // this should improve performance, 'cause then we're not waiting on the db
      request(app)
        .put('/user/ee7450e0-25f3-4d8a-ad5f-0849d627141c')
        .set('pw', require('./pw'))
        .set('Accept', 'application/json')
        .send({
          username: "the most edge lord",
        })
        .expect(403)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.code).to.equal('ForbiddenError');
          expect(res.body.message).to.equal("Can't update username");
          return done();
        });
    })
    
    it('prevents changing of username', done => {
      db.r.tableCreate('users').run().then(() => {
        return db.makeUser("cavejay", 'foo', 'bar', 'hi@hi.com', '9123jasdkFDf1');
      }).then(uid => {
        request(app)
          .put('/user/'+uid)
          .set('pw', require('./pw'))
          .set('Accept', 'application/json')
          .send({
            username: "edgelord",
          })
          .expect(403)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.code).to.equal('ForbiddenError');
            expect(res.body.message).to.equal("Can't update username");
            return done();
          });
      });
    });
    
    it('doesn\'t change data when something fails', done => {
      db.r.tableCreate('users').run().then(() => {
        return db.makeUser("cavejay", 'foo', 'bar', 'hi@hi.com', '9123jasdkFDf1');
      }).then(uid => {
        return db.getUser(uid);
      }).then(userData => {
        request(app)
          .put('/user/'+userData.id)
          .set('pw', require('./pw'))
          .set('Accept', 'application/json')
          .send({
            email: "heh@@foo.bar",
          })
          .expect(422)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.code).to.equal('UnprocessableEntityError');
            expect(res.body.message).to.equal("Email is invalid");

            // compare user data from before and now
            db.getUser(userData.id).then( result => {
              expect(result).to.deep.equal(userData);
              return done();
            });

          });
      });
    });

    it('updates only the part of the user that\'s relevant', done => {
      db.r.tableCreate('users').run().then(() => {
        return db.makeUser("cavejay", 'foo', 'bar', 'hi@hi.com', '9123jasdkFDf1');
      }).then(uid => {
        return db.getUser(uid);
      }).then(userData => {
        request(app)
          .put('/user/'+userData.id)
          .set('pw', require('./pw'))
          .set('Accept', 'application/json')
          .send({
            email: "heh@foo.bar",
          })
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);

            // make sure it matches what was expected
            userData.email = "heh@foo.bar";
            expect(userData).to.deep.equal(res.body);

            // make sure it matches what was recorded
            db.getUser(res.body.id).then( result => {
              expect(result).to.deep.equal(res.body);
              return done();
            });
          });
      });
    });

    it('doesn\'t add fields that shouldn\'t exist to the user', done => {
      db.r.tableCreate('users').run().then(() => {
        return db.makeUser("cavejay", 'foo', 'bar', 'hi@hi.com', '9123jasdkFDf1');
      }).then(uid => {
        request(app)
          .put('/user/'+uid)
          .set('pw', require('./pw'))
          .set('Accept', 'application/json')
          .send({
            email: "legitemail@outlook.com",
            superhack: "sum_script_here"
          })
          .expect(422)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.code).to.equal('UnprocessableEntityError');
            expect(res.body.message).to.equal("Invalid Field");
            return done();
          });
      });
    });
  });

  describe.only('/user/delete', function () {
    it('requires extra authentication');

    it('gives a proper failure message for bad authentication')

    it('removes the user info', done => {
      Promise.all([
        db.r.tableCreate('users').run(),
        db.r.tableCreate('entries').run()
      ]).then(() => {
        return db.makeUser("cavejay", 'foo', 'bar', 'hi@hi.com', '9123jasdkFDf1');
      }).then(uid => {
        request(app)
          .del('/user/'+uid)
          .set('pw', require('./pw'))
          .send()
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body).to.be.empty;

            db.checkForUser(uid).then(result => {
              expect(result).to.be.false;
              return done();
            });
          });
      })
    });

    it('removes all of the user\'s entries from the database', done => {
      Promise.all([
        db.r.tableCreate('users').run(),
        db.r.tableCreate('entries').run()
      ]).then(() => {
        return db.makeUser("cavejay", 'foob', 'obar', 'hi@hi.com', '9123jasdkFDf1');
      }).then(uid => {
        entries = [
          {uid: uid,datetime: '12312344124',text: 'test1'},
          {uid: uid,datetime: '12312324124',text: 'test2',  oldtext: ['lol not a test', 'lol mott a tet']},
          {uid: 'aas-asdgq',datetime: '12312354124',text: ''},
          {uid: 'asdasd-13213-',datetime: '12312488124',text: ''}
        ]
        db.makeEntries(entries).then(eids => {
          request(app)
            .del('/user/'+uid)
            .set('pw', require('./pw'))
            .send()
            .expect(200)
            .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.be.empty;

              db.getEntry(eids[0]).then(result => {
                expect(result).to.be.null;
                return db.getEntry(eids[1]);
              }).then(result => {
                expect(result).to.be.null;
                return done();
              });

              // Should also check we're not removing other things from the entries
            });
        });
      });
    });

    it('frees up the deleted user\'s username for reuse', done => {
      Promise.all([
        db.r.tableCreate('users').run(),
        db.r.tableCreate('entries').run()
      ]).then(() => {
        return db.makeUser("cavejay", 'foob', 'obar', 'hi@hi.com', '9123jasdkFDf1');
      }).then(uid => {
        request(app)
          .del('/user/'+uid)
          .set('pw', require('./pw'))
          .send()
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body).to.be.empty;
            
            // Try to make a new user with the same username here
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
                done();
              })
          });
      });
    });
  });

  describe('/user/fetch/:uid', function () {
    it('Doesn\'t except invalid fields');
    it('fails when the user doesn\'t exist');
    it('allows access to the user that is signed in');
    it('prevents duplicate fields in the request');
    it('will only fetch the fields requested');
    it('will fetch all the user\'s data on the optional /all endpoint');
  });
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
