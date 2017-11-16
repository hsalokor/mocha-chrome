(function (root) {
  'use strict';

  const emit = (event, data) => {
    window._eventbus.emit('mocha-event', { event, data });
  };

  const retransmit = (runner, event, fn) => {
    runner.on(event, (data, err) => {
      if (data) {
        const keys = Object.keys(data);
        const parentKeys = data.hasOwnProperty('parent') ? Object.keys(data.parent) : [];
        const serializedData = serializr.serialize(data);
        window._eventbus.emit('mocha-event', { event, keys, parentKeys, data : serializedData, err });
      }
      else {
        window._eventbus.emit('mocha-event', { event });
      }
    });
  };

  // Note: field 'parent' creates circular dependency
  root._mochabridge = function (runner) {

    const errorSchema = {
      factory: context => new Error(message),
      props: {
        message: serializr.primitive(),
        name: serializr.primitive()
      }
    };

    const testSchema = {
      factory: context => new Mocha.Test(context.json.title),
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

    runner.on('start', () => emit('start', {}));

    runner.on('suite', (data) => emit('suite', serializr.serialize(suiteSchema, data)));
    runner.on('suite end', (data) => emit('suite end', serializr.serialize(suiteSchema, data)));

    runner.on('test', (data) => emit('test', serializr.serialize(testSchema, data)));

    runner.on('pass', (data) => emit('pass', serializr.serialize(testSchema, data)));
    runner.on('fail', (data) => emit('fail', serializr.serialize(testSchema, data)));
    /*
    retransmit(runner, 'suite');
    retransmit(runner, 'suite end');

    retransmit(runner, 'test');
    retransmit(runner, 'test end');
    retransmit(runner, 'pending');

    retransmit(runner, 'fail');
    retransmit(runner, 'pass');
    */

    runner.on('end', () => emit('end'));
  };
})(window);
