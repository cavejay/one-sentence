// For testing
var r = require('rethinkdbdash')();
var db = require('./database');
var assert = require('assert');
they = it;

var cleanTables = () => {
  var t = function (a) {
    if (a.length > 1) {
      return r.tableDrop(a.shift()).run().then(() => {
        return t(a);
      });
    } else if (a.length == 1) {
      return r.tableDrop(a.shift()).run();
    } else {
      return r.tableList().run();
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

  it('can remove documents', done => {
    r.table('test').insert({hello: 'there', ima: 'document'}).run()
    .then(result => {
      key = result.generated_keys[0];
      return r.table('test').get(key).delete().run();
    })
    .then(result => {
      return r.table('test').get(key).run();
    })
    .then((result) => {
      if (result == null) {
        done();
      }
    })
  });
});

describe('db initialiasation', function () {
  it('creates correct tables', done => {
    var expected = ['users', 'entries', 'test']; // TODO this shouldn't include test
    db.init().then(function () {
      return r.tableList().run();
    }).then(tables => {
      assert.deepEqual(tables.sort(), expected.sort());
      done();
    });
  });

  it('creates missing tables', done => {
    var expected = ['users', 'entries', 'test'];
    r.tableCreate('users').run().then(() => {
      return db.init();
    }).then(() => {
      return r.tableList().run();
    }).then((tables) => {
      assert.deepEqual(tables.sort(), expected.sort());
      done();
    });
  });

  it('doesn\'t attempt to create existing tables', done => {
    var expected = ['users', 'entries', 'test'];
    r.tableCreate('users').run().then(() => {
      return r.tableCreate('entries').run();
    }).then(() => {
      return db.init();
    }).then(() => {
      return r.tableList().run();
    }).then((tables) => {
      assert.deepEqual(tables.sort(), expected.sort());
      done();
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
  var test_uid = '000231-1231230';

  they('get added to users correctly', done => {
    var entry = makeEntryObj(test_uid, 1469995208111, 'test entry');
    r.tableCreate('entries').run().then(() => {
      return db.makeEntry(entry);
    }).then(eid => {
      entry.id = eid;
      return r.table('entries').get(eid).run();
    }).then(result => {
      assert.deepEqual(entry, result);
      done();
    })
  });

  they('can be removed from users correctly', done => {
    var entry = makeEntryObj(test_uid, 1469995208111, 'test entry');
    r.tableCreate('entries').run().then(() => {
      return r.table('entries').insert(entry).run();
    }).then((result) => {
      entry.eid = result.generated_keys[0];
      return db.removeEntry(entry.eid);
    }).then(() => {
      return r.table('entries').get(entry.eid).run();
    }).then(result => {
      if (result == null) {
        done();
      }
    });
  });

  they('can be updated by users correctly', done => {
    var entry = makeEntryObj(test_uid, 1469995208111, 'test entry test');
    r.tableCreate('entries').run().then(() => {
      return r.table('entries').insert(entry).run();
    }).then((result) => {
      entry.id = result.generated_keys[0];
      entry.oldtext = entry.text;
      entry.text = "This is the updated";
      return db.updateEntry(entry.id, {text: entry.text});
    }).then((result) => {
      assert.deepEqual(result, entry);
      return db.getEntry(entry.id);
    }).then(result => {
      assert.deepEqual(entry, result);
      done();
    });
  });

  they('can be retrieved singularly', done => {
    var entry = makeEntryObj(test_uid, 1469995208111, 'test entry test');
    r.tableCreate('entries').run().then(() => {
      return r.table('entries').insert(entry).run();
    }).then((result) => {
      entry.id = result.generated_keys[0];
      return r.table('entries').insert(makeEntryObj("1231232-31238849", 144998923, 'other test entry')).run();
    }).then(() => {
      return db.getEntry(entry.id);
    }).then(result => {
      assert.deepEqual(entry, result);
      done();
    });
  });

  they('and as a range of dates', done => {
    var entry_in = makeEntryObj(test_uid, 1469995208111, 'test entry test');
    var entry2_in = makeEntryObj(test_uid, 1469995248111, 'test');
    var entry3_out = makeEntryObj(test_uid, 1469995288111, 'blah test');
    var entry4_out = makeEntryObj("00123-12345512", 1469995288111, 'blah test');
    r.tableCreate('entries').run().then(() => {
      return r.table('entries').insert([entry_in, entry2_in, entry3_out, entry4_out]).run();
    }).then((result) => {
      entry_in.id = result.generated_keys[0];
      entry2_in.id = result.generated_keys[1];
      entry3_out.id = result.generated_keys[2];
      return db.getEntryRange(test_uid, 1469995208000, 1469995250000);
    }).then(result => {
      assert.deepEqual([entry_in, entry2_in], result);
      done();
    });
  });
});

var makeEntryObj = function (uid, datetime, text, oldtext, deleted) {
  var obj = {
    uid: uid,
    datetime: datetime,
    text: text
  }
  if (oldtext) {
    obj.oldtext = oldtext;
  }
  if (deleted) {
    obj.deleted = deleted;
  }
  return obj;
}
