// For testing
var r = require('rethinkdbdash')();
var db = require('./database');

beforeEach(function (done) {
  r.tableCreate('test').run().then(result => {
    done();
  });
});

afterEach(function (done) {
  r.tableDrop('test').run().then(result => {
    done();
  });
})

describe('Basic db test', function () {
  it('can store documents', (done) => {
    r.table('test')
      .insert({
        test: true,
        name: 'hi'
      }).run()
    .then((result) => {
      return r.table('test').run();
    })
    .then((result) => {
      if (result[0].name == 'hi') {
        done();
      }
    });
  });

  it('can update documents', (done) => {
    r.table('test').insert({name: 'lol', number: 123123}).run()
    .then((result) => {
      key = result.generated_keys[0];
      return r.table('test').get(key).update({newField: 'HAHA!'}).run();
    })
    .then((result) => {
      return r.table('test').get(key).run();
    })
    .then((result) => {
      if (result.newField == 'HAHA!') {
        done();
      }
    })
  });

  it('can remove documents', (done) => {
    r.table('test').insert({hello: 'there', ima: 'document'}).run()
    .then((result) => {
      key = result.generated_keys[0];
      return r.table('test').get(key).delete().run();
    })
    .then((result) => {
      return r.table('test').get(key).run();
    })
    .then((result) => {
      if (result == null) {
        done();
      }
    })
  });
});
