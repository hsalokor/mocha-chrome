(function (root) {
  'use strict';

  const pick = (o, ...props) => Object.assign({}, ...props.map(prop => ({[prop]: o[prop]})));

  const retransmit = (runner, event, ...props) => {
    runner.on(event, (data, details) => {
      const filteredData = data ? pick(data, ...props) : {};
      const keys = data ? Object.keys(data) : [];
      window._eventbus.emit('mocha-event', { event, keys, data: filteredData, details });
    });
  };

  // Note: field 'parent' creates circular dependency
  root._mochabridge = function (runner) {
    retransmit(runner, 'start');

    retransmit(runner, 'suite', 'title', 'body', 'async', 'sync', 'timedOut', 'pending', 'type', 'file', '_trace');
    retransmit(runner, 'suite end', 'title', 'body', 'async', 'sync', 'timedOut', 'pending', 'type', 'file', '_trace');

    retransmit(runner, 'hook', 'title', 'body', 'async', 'sync', 'timedOut', 'pending', 'type', 'file', '_slow', '_trace');
    retransmit(runner, 'hook end', 'title', 'body', 'async', 'sync', 'timedOut', 'pending', 'type', 'file', '_trace');

    retransmit(runner, 'test', 'title', 'body', 'async', 'sync', 'timedOut', 'pending', 'type', 'file', '_trace');
    retransmit(runner, 'test end', 'title', 'body', 'async', 'sync', 'timedOut', 'pending', 'type', 'file', '_trace');
    retransmit(runner, 'pending', 'title', 'body', 'async', 'sync', 'timedOut', 'pending', 'type', 'file', '_trace');

    retransmit(runner, 'fail', 'title', 'fn', 'body', 'async', 'sync', 'timedOut', 'pending', 'type', 'file', 'callback', 'duration', 'state', '_trace');
    retransmit(runner, 'pass', 'title', 'body', 'async', 'sync', 'timedOut', 'pending', 'type', 'file', 'callback', 'duration', 'state');

    retransmit(runner, 'end');
  };
})(window);
