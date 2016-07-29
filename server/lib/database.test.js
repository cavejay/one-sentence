// For testing
var r = require('rethinkdbdash')();
var db = require('./database');

var cleanTables = () => {
  var t = function (a) {
    if (a.length > 1) {
      return r.tableDrop(a.shift()).run().then(() => {
        return t(a);
      });
    } else {
      return r.tableDrop(a.shift()).run();
    }
  };

  return r.tableList().run().then(tables => {
    return t(tables);
  });
}

beforeEach(function (done) {
  r.tableList().run().then(result => {
    if (result.length > 0) {
      console.log('There are uncleaned Tables: ', result);
    }
    return cleanTables();
  }).then(() => {
    return r.tableCreate('test').run();
  }).then(result => {
    done();
  });
});

afterEach(function (done) {
  cleanTables().then(() => {
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

describe('Upkeep', function () {
  it.skip('creates correctly identifies missing tables', (done) => {
    var expected = ['users', 'entries'];
    db.init().then(() => {
      r.tablelist().run().then((tables) => {
        if (expected == tables) {
          done();
        }
      });
    });
  });

});

describe('Users', function () {
  it('Creates correct users');
  it('updates user information');
  it('removes user information');
  it('fetches correct users');

});

describe('Diary Entries', function () {
  it('gets added to users correctly');
  it('can be removed from users correctly');
  it('can be updated by users correctly');

});
