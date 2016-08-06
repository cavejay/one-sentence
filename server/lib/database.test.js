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

describe('Basic db test -- ', function () {
  it('can store documents', (done) => {
    r.table('test')
      .insert({
        test: true,
        name: 'hi'
      }).run()
    .then((result) => {
      return r.table('test').run();
    }).then((result) => {
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
    }).then((result) => {
      return r.table('test').get(key).run();
    }).then((result) => {
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
    }).then(result => {
      return r.table('test').get(key).run();
    }).then((result) => {
      if (result == null) {
        done();
      }
    })
  });
});

describe('db initialiasation -- ', function () {
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

describe('Users Endpoints -- ', function () {
  var ex = {
    name: ['First', 'last'],
    username: 'user1',
    pwhash: '1jjkjl12k39sad'
  };

  describe('The User creation endpoint:', function () {
    var ee = Object.assign({}, ex);
    it('correctly creates users', done => {
      r.tableCreate('users').run().then(() => {
        return db.makeUser(ex.username, ex.name[0], ex.name[1], ex.pwhash);
      }).then(result => {
        ee.id = result;
        return r.table('users').get(result).run();
      }).then(result => {
        assert.deepEqual(ee, result);
        done();
      });
    });
  });

  describe('The User update endpoint:', function () {
    it('updates user information', done => {
      var id;
      var ee = Object.assign({}, ex);
      ee.name[0] = 'Not the';
      ee.settings = {tracking: false};
      r.tableCreate('users').run().then(() => {
        return r.table('users').insert(ex).run();
      }).then(result => {
        id = result.generated_keys[0];
        return db.updateUser(id, ee);
      }).then(() => {
        return r.table('users').get(id).run();
      }).then(result => {
        ee.id = id;
        assert.deepEqual(ee, result);
        done();
      });
    });
  });

  describe('The User delete endpoint:', function () {
    it('removes user information', done => {
      var ee = Object.assign({}, ex);
      r.tableCreate('users').run().then(() => {
        return r.table('users').insert(ee).run();
      }).then((result) => {
        ee.id = result.generated_keys[0];
        return db.removeUser(ee.id);
      }).then(() => {
        return r.table('users').get(ee.id).run();
      }).then(result => {
        if (result == null) {
          done();
        }
      });
    });
  });

  describe('The User fetch/get endpoint:', function () {
    it('fetches the correct user', done => {
      var ee = Object.assign({}, ex);
      r.tableCreate('users').run().then(() => {
        return r.table('users').insert(ee).run();
      }).then((result) => {
        ee.id = result.generated_keys[0];
        return db.makeUser('lolcat', 'hi', 'there', '123241');
      }).then(() => {
        return db.getUser(ee.id);
      }).then(result => {
        assert.deepEqual(ee, result);
        done();
      });
    });

    it('can fetch all entries of a single user', done => {
      var uid;
      var entries = [];
      r.tableCreate('users').run().then(() => {
        return r.tableCreate('entries').run();
      }).then(() => {
        return db.makeUser('test', 'te', 'st', '123013j');
      }).then(id => {
        uid = id;
        entries[0] = makeEntryObj(uid, 0123123123, 'diary text');
        entries[1] = makeEntryObj(uid, 0189787778, 'a;lsdkfjadsf');
        entries[2] = makeEntryObj(uid, 0129769769, 'this is life now');
        return db.makeEntries(entries);
      }).then((eids) => {
        entries = entries.map((ele, i) => {
          ele.id = eids[i];
          return ele;
        });
        return db.getAllEntriesForUser(uid, false);
      }).then(result => {
        assert.deepEqual(result.sort((a,b)=> {return a.datetime>b.datetime}), entries.sort((a,b)=> {return a.datetime>b.datetime}));
        done();
      });
    });

    it('can fetch all entries of a single user as entryids', done => {
      var uid;
      var entries = [];
      r.tableCreate('users').run().then(() => {
        return r.tableCreate('entries').run();
      }).then(() => {
        return db.makeUser('test', 'te', 'st', '123013j');
      }).then(id => {
        uid = id;
        entries[0] = makeEntryObj(uid, 0123123123, 'diary text');
        entries[1] = makeEntryObj(uid, 0189787778, 'a;lsdkfjadsf');
        entries[2] = makeEntryObj(uid, 0129769769, 'this is life now');
        return db.makeEntries(entries);
      }).then((eids) => {
        entries = eids;
        return db.getAllEntriesForUser(uid, true);
      }).then(result => {
        assert.deepEqual(result.sort(), entries.sort());
        done();
      });
    });

    it.skip('can fetch x entries from entry y for a single user (+ve)', done => {
      var uid;
      var entries = [];
      r.tableCreate('users').run().then(() => {
        return r.tableCreate('entries').run();
      }).then(() => {
        return db.makeUser('test', 'te', 'st', '123013j');
      }).then(id => {
        uid = id;
        entries[0] = makeEntryObj(uid, 1400000000, 'one');
        entries[1] = makeEntryObj(uid, 1400000022, 'two');
        entries[2] = makeEntryObj(uid, 1400000044, 'three');
        entries[3] = makeEntryObj(uid, 1400000123, 'four');
        entries[4] = makeEntryObj(uid, 1400000222, 'five');
        return db.makeEntries(entries);
      }).then(eids => {
        entries = entries.map((e, i) => {e.id = eids[i]; return e;});
        return db.getXEntriesFromEntry(uid, eids[2], 3);
      }).then(result => {
        assert.deepEqual(result, [entries[2], entries[3], entries[4]]);
        done();
      });
    });

    it.skip('can fetch x entries from entry y for a single user (-ve)', done => {
      var uid;
      var entries = [];
      r.tableCreate('users').run().then(() => {
        return r.tableCreate('entries').run();
      }).then(() => {
        return db.makeUser('test', 'te', 'st', '123013j');
      }).then(id => {
        uid = id;
        entries[0] = makeEntryObj(uid, 1400000000, 'one');
        entries[1] = makeEntryObj(uid, 1400000022, 'two');
        entries[2] = makeEntryObj(uid, 1400000044, 'three');
        entries[3] = makeEntryObj(uid, 1400000123, 'four');
        entries[4] = makeEntryObj(uid, 1400000222, 'five');
        return db.makeEntries(entries);
      }).then(eids => {
        entries = entries.map((e, i) => {e.id = eids[i]; return e;});
        return db.getXEntriesFromEntry(uid, eids[3], -3);
      }).then(result => {
        assert.deepEqual(result, [entries[3], entries[2], entries[1]]);
        done();
      });
    });
  });
});

describe('Diary Entry Endpoints --', function () {
  var test_uid = '000231-1231230';

  describe('The entry creation endpoint:', function () {
    it('makes diary entries correctly', done => {
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
  });

  describe('the entry removal endpoint:', function () {
    it('removes entries correctly', done => {
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
  });

  describe('the entry update endpoint:', function () {
    it('updates entries correctly', done => {
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
  });

  describe('the entry fetching endpoint:', function () {
    it('can retrieve a single entry', done => {
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

    it('can retrieve a time-range of entries', done => {
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
