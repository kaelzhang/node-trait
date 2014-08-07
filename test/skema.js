'use strict';

var expect = require('chai').expect;
var skema = require('../index');

var attr = skema({
  a: {
    type: 'string'
  },

  b: {
    type: 'number'
  },

  c: {
    type: 'boolean'
  },

  d: {
    type: 'path'
  },

  e: {
    type: 'url'
  },

  f: {

  },

  g: {
    value: 'abc'
  },

  h: {
    value: 'abc',
    enumerable: false
  },

  h2: {
    value: 'abc',
    enumerable: true
  },

  h3: {
    value: 'abc'
  },

  i: {
    value: 'abc',
    writable: false
  },

  i2: {
    value: 'abc',
    writable: true
  },

  i3: {
    value: 'abc'
  }
});

describe("basic types", function() {
  it("string type", function() {
    attr.set('a', '1');
    expect(attr.get('a')).to.equal('1');
  });

  it("string type, convertion:", function() {
    attr.set('a', 1);
    expect(attr.get('a')).to.equal('1');
    expect(attr.get('a')).not.to.equal(1);
  });

  it("number", function() {
    attr.set('b', 1);
    expect(attr.get('b')).to.equal(1);

    attr.set('b', '1');
    expect(attr.get('b')).to.equal(1);
  });

  it("boolean", function() {
    attr.set('c', 1);
    expect(attr.get('c')).to.equal(true);

    attr.set('c', 0);
    expect(attr.get('c')).to.equal(false);
  });

  it("path", function() {
    var node_path = require('path');
    var value = 'abc';
    var real_value = node_path.resolve(value);

    attr.set('d', value);
    expect(attr.get('d')).to.equal(real_value);
  });

  it("url", function() {
    expect(attr.set('e', 'abc.com')).to.equal(false)
  });

  it("no type", function() {
    var a = {};
    attr.set('f', a);
    expect(attr.get('f')).to.equal(a);
  });
});


describe("default value", function() {
  it("default", function() {
    expect(attr.get('g')).to.equal('abc');
  });

  it(".reset()", function() {
    attr.set('g', 123);
    expect(attr.get('g')).to.equal(123);

    attr.reset('g');
    expect(attr.get('g')).to.equal('abc');
  });
});


describe("enumerable:", function() {
  var list = attr.enumerable();
  var all = attr.get();

  it("false", function() {
    expect(list.indexOf('h')).to.equal(-1);

    attr.set('h', 1);
    expect(attr.get('h')).to.equal(1);
    expect('h' in all).to.equal(false);
  });

  it("true", function() {
    expect(list.indexOf('h2')).not.to.equal(-1);

    attr.set('h2', 1);
    expect(attr.get('h2')).to.equal(1);
    expect('h2' in all).to.equal(true);
  });

  it("(not set)", function() {
    expect(list.indexOf('h3')).not.to.equal(-1);

    attr.set('h3', 1);
    expect(attr.get('h3')).to.equal(1);
    expect('h3' in all).to.equal(true);
  });
});


describe("writable:", function() {
  var list = attr.writable();

  it("false", function() {
    expect(list.indexOf('i')).to.equal(-1);

    expect(attr.set('i', 1)).to.equal(false);
    expect(attr.get('i')).to.equal('abc');
  });

  it("true", function() {
    expect(list.indexOf('i2')).not.to.equal(-1);

    expect(attr.set('i2', 1)).to.equal(true);
    expect(attr.get('i2')).to.equal(1);
  });

  it("(not set)", function() {
    expect(list.indexOf('i3')).not.to.equal(-1);
    expect(attr.set('i3', 1)).to.equal(true);
    expect(attr.get('i3')).to.equal(1);
  });
});