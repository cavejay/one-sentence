checks = require('./checks');
var expect = require('chai').expect;

describe.only('-- Testing Checks --', function () {
  it('checkUsernameValidity', () => {
    expect(checks.checkUsernameValidity("cavejay")).to.be.true;
    expect(checks.checkUsernameValidity("This_is_a_valid_user")).to.be.true;
    expect(checks.checkUsernameValidity("so-is-this")).to.be.true;
    expect(checks.checkUsernameValidity("jimmie fallon")).to.be.false;
    expect(checks.checkUsernameValidity("foobar!")).to.be.false;
    expect(checks.checkUsernameValidity("\"userlol")).to.be.false;
    expect(checks.checkUsernameValidity("this-would-have-been-valid/")).to.be.false;
  });
  it('checkPasswordValidity', () => {
    expect(checks.checkPasswordValidity("PerfectPassword11")).to.be.true;
    expect(checks.checkPasswordValidity("nocapss23")).to.be.false;
    expect(checks.checkPasswordValidity("NoNumbersWeAteThem")).to.be.false;
    expect(checks.checkPasswordValidity("2Short")).to.be.false;
    expect(checks.checkPasswordValidity("no-hypehn")).to.be.false;
    expect(checks.checkPasswordValidity("no_underscore")).to.be.false;
    expect(checks.checkPasswordValidity("ALLCAPSLOL2")).to.be.false;
    expect(checks.checkPasswordValidity("Why have space")).to.be.false;
  });
  it('checkEmailValidity', () => {
    expect(checks.checkEmailValidity("cavejay@github.io")).to.be.true;
    expect(checks.checkEmailValidity("c@g.io")).to.be.true;
    expect(checks.checkEmailValidity("foo.bar.lol@gmail.com")).to.be.true;
    expect(checks.checkEmailValidity("asd@cave.jay.asd")).to.be.true;
    expect(checks.checkEmailValidity("foobar")).to.be.false;
    expect(checks.checkEmailValidity("foobar.io")).to.be.false;
    expect(checks.checkEmailValidity("foo@bario")).to.be.false;
    expect(checks.checkEmailValidity("foo@.bar")).to.be.false;
    expect(checks.checkEmailValidity("foo@bar.")).to.be.false;
    expect(checks.checkEmailValidity("@foobar.io")).to.be.false;
    expect(checks.checkEmailValidity("foo@bar@f.com")).to.be.false;
    expect(checks.checkEmailValidity("fo\"o.bar!.lol@gmail.com")).to.be.false;
    expect(checks.checkEmailValidity("foo@bar.com.")).to.be.false;
  });
});
