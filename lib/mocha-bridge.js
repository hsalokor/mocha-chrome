'use strict';

const nanobus = require('nanobus');
const Mocha = require('mocha');

module.exports = class MochaBridge {
  constructor (log) {
    this.bus = nanobus();
    this.log = log;

    log.info('MochaBridge initialized');
  }

  emit (eventName, data, err) {
    console.log("EMIT!!!", data);
    if (eventName == 'pass' || eventName == 'fail') {
      let test = new Mocha.Test(data.title);
      Object.assign(test, data);
      this.bus.emit(eventName, test, err);
    }
    else {
      this.bus.emit(eventName, data, err);
    }
  }

  on (eventName, fn) {
    this.bus.on(eventName, fn);
  }
};