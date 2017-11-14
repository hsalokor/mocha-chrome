'use strict';

const nanobus = require('nanobus');
const Mocha = require('mocha');

class MiniContext {
   slow () {
     return false;
   }
};

module.exports = class MochaBridge {
  constructor (log) {
    this.bus = nanobus();
    this.log = log;

    log.info('MochaBridge initialized');
  }

  emit (eventName, data, details) {
    const context = new MiniContext();
    Object.assign(context, data);
    this.bus.emit(eventName, context, details);
  }

  on (eventName, fn) {
    this.bus.on(eventName, fn);
  }
};