(function (root) {
  'use strict';

  const retransmit = (runner, event) => {
    runner.on(event, (data, err) => {
      const keys = data ? Object.keys(data) : [];
      const parentKeys = data && data.hasOwnProperty('parent') ? Object.keys(data.parent) : [];
      const serializedData = data ? CircularJSON.stringify(data) : CircularJSON.stringify({});
      window._eventbus.emit('mocha-event', { event, keys, parentKeys, data : serializedData, err });
    });
  };

  // Note: field 'parent' creates circular dependency
  root._mochabridge = function (runner) {
    retransmit(runner, 'start');

    retransmit(runner, 'suite');
    retransmit(runner, 'suite end');

    retransmit(runner, 'hook');
    retransmit(runner, 'hook end');

    retransmit(runner, 'test');
    retransmit(runner, 'test end');
    retransmit(runner, 'pending');

    retransmit(runner, 'fail');
    retransmit(runner, 'pass');

    retransmit(runner, 'end');
  };
})(window);
