(function (root) {
  'use strict';

  const pick = (o, ...props) => Object.assign({}, ...props.map(prop => ({[prop]: o[prop]})));

  const retransmit = (runner, event, ...props) => {
    runner.on(event, (data, err) => {
      const d = data ? pick(data, ...props) : {};
      const parent = data && data.hasOwnProperty('parent') ? pick(data.parent, ...props) : null;
      const filteredData = Object.assign({}, d, { parent, err: err ? err : {} });
      const keys = data ? Object.keys(data) : [];
      const parentKeys = data && data.hasOwnProperty('parent') ? Object.keys(data.parent) : [];
      window._eventbus.emit('mocha-event', { event, keys, parentKeys, data: filteredData, err });
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

    retransmit(runner, 'fail', 'title', 'err', 'body', 'async', 'sync', 'timedOut', 'pending', 'type', 'file', 'callback', 'duration', 'state', '_trace');
    retransmit(runner, 'pass', 'title', 'body', 'async', 'sync', 'timedOut', 'pending', 'type', 'file', 'callback', 'duration', 'state');

    retransmit(runner, 'end');
  };
})(window);
