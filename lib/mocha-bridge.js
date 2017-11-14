'use strict';

const nanobus = require('nanobus');
const Mocha = require('mocha');

class MiniParent {
  fullTitle () {
    return this.title;
  }
  slow () {
    return false;
  }
};

class MiniContext {
  static slow () {
    return false;
  }
  static isPending () {
    return false;
  }
};

module.exports = class MochaBridge {
  constructor (log) {
    this.bus = nanobus();
    this.log = log;

    log.info('MochaBridge initialized');
  }

  emit (eventName, data, err) {
    const context = new MiniContext();
    const parent = new MiniParent();
    Object.assign(context, data);
    Object.assign(parent, data.parent);
    context.parent = parent;
    this.bus.emit(eventName, [context, err]);
  }

  on (eventName, fn) {
    this.bus.on(eventName, fn);
  }
};