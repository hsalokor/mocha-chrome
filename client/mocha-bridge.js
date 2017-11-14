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

  root._mochabridge = function (runner) {
    retransmit(runner, 'start');

    // field 'parent' creates circular dependency
    retransmit(runner, 'test', 'title', 'body', 'async', 'sync', 'timedOut', 'pending', 'type', 'file', '_trace');

    retransmit(runner, 'fail', 'title', 'fn', 'body', 'async', 'sync', 'timedOut', 'pending', 'type', 'file', 'callback', 'duration', 'state', '_trace');

    retransmit(runner, 'pass', 'title', 'body', 'async', 'sync', 'timedOut', 'pending', 'type', 'file', 'callback', 'duration', 'state');

    retransmit(runner, 'end');
  };
})(window);
