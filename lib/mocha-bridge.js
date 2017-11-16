'use strict';

const serializr = require('serializr');
const nanobus = require('nanobus');
const Mocha = require('mocha');

const errorSchema = {
  factory: context => new Error(context.json.message),
  props: {
    message: serializr.primitive(),
    name: serializr.primitive()
  }
};

const testSchema = {
  factory: context => {
    const test = new Mocha.Test(context.json.title);
    Mocha.Test.prototype.slow = function () { return this._slow; };
    console.log(Object.keys(test.clone()));
    return test;
  },
  props: {
    title: serializr.primitive(),
    body: serializr.primitive(),
    async: serializr.primitive(),
    sync: serializr.primitive(),
    _timeout: serializr.primitive(),
    _slow: serializr.primitive(),
    _enableTimeouts: serializr.primitive(),
    timedOut: serializr.primitive(),
    _trace: serializr.object(errorSchema),
    _retries: serializr.primitive(),
    _currentRetry: serializr.primitive(),
    pending: serializr.primitive()
  }
};

const suiteSchema = {
  factory: context => new Mocha.Suite(context.json.title),
  props: {
    title: serializr.primitive(),
    /*
    suites: serializr.object(Mocha.Suite),
    */
    tests: serializr.list(serializr.object(testSchema)),
    pending: serializr.primitive(),
    root: serializr.primitive(),
    _timeout: serializr.primitive(),
    _enableTimeouts: serializr.primitive(),
    _slow: serializr.primitive(),
    _bail: serializr.primitive(),
    _retries: serializr.primitive(),
    /*
    _onlyTests: serializr.primitive(),
    _onlySuites: serializr.primitive(),
    */
    delayed: serializr.primitive()
  }
};

module.exports = class MochaBridge {
  constructor (log) {
    this.bus = nanobus();
    this.log = log;

    log.info('MochaBridge initialized');
  }

  emit (eventName, data, err) {
    if (eventName == 'suite') {
      this.bus.emit(eventName, serializr.deserialize(suiteSchema, data), err);
    }
    else if (eventName == 'test') {
      this.bus.emit(eventName, serializr.deserialize(testSchema, data), err);
    }
    else if (eventName == 'pass') {
      this.bus.emit(eventName, serializr.deserialize(testSchema, data), err);
    }
    else if (eventName == 'fail') {
      this.bus.emit(eventName, serializr.deserialize(testSchema, data), err);
    }
    this.bus.emit(eventName, data, err);
  }

  on (eventName, fn) {
    this.bus.on(eventName, fn);
  }
};