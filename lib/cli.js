#!/usr/bin/env node
'use strict';

const chalk = require('chalk');
const deepAssign = require('deep-assign');
const fs = require('fs');
const meow = require('meow');
const path = require('path');
const Mocha = require('mocha');
const log = require('loglevel');

const MochaBridge = require('./mocha-bridge');

const MochaChrome = require('../');
const cli = meow(chalk`{underline Usage}
  $ mocha-chrome <file.html> [options]


{underline Options}
  --chrome-flags              A JSON string representing an array of flags to pass to Chrome
  --ignore-console            Suppress console logging
  --ignore-exceptions         Suppress exceptions logging
  --ignore-resource-errors    Suppress resource error logging
  --log-level                 Specify a log level; trace, debug, info, warn, error
  --mocha                     A JSON string representing a config object to pass to Mocha
  --no-colors                 Disable colors in Mocha's output
  --old-and-busted            Take pity upon users of old-node. This option will run moche-chrome
                              under Node < 8 using babel-register. Use at your own risk, and
                              without support.
  --reporter                  Specify the Mocha reporter to use
  --timeout                   Specify the test startup timeout to use
  --version


{underline Examples}
  $ mocha-chrome test.html --no-colors
  $ mocha-chrome test.html --reporter dot
  $ mocha-chrome test.html --mocha '\{"ui":"tdd"\}'
  $ mocha-chrome test.html --chrome-flags '["--some-flag", "--and-another-one"]'
`);

if (!cli.input.length && (!Object.getOwnPropertyNames(cli.flags).length || cli.flags.oldAndBusted)) {
  cli.showHelp();
}

const file = cli.input[0];
const flags = cli.flags;
let url = file,
  code = 0;

function fail (message) {
  console.log(message);
  process.exit(1);
}

if (!file && !file.length) {
  fail('You must specify a file to run');
}

if (!/^(file|http(s?)):\/\//.test(file)) {
  if (!fs.existsSync(file)) {
    url = 'file://' + path.resolve(path.join(process.cwd(), file));
  }

  if (!fs.existsSync(file)) {
    fail('You must specify an existing file.');
  }

  url = 'file://' + fs.realpathSync(file);
}

const useColors = !flags.colors;
const reporter = flags.reporter || 'spec';
const mochaOptions = Object.assign(JSON.parse(flags.mocha || '{}'), { useColors, reporter });
const chromeFlags = JSON.parse(flags.chromeFlags || '[]');
const { logLevel, ignoreExceptions, ignoreConsole, ignoreResourceErrors } = flags;
const options = {
  chromeFlags,
  ignoreExceptions,
  ignoreConsole,
  ignoreResourceErrors,
  logLevel,
  mocha: mochaOptions,
  url
};
const runner = new MochaChrome(options);
const mochaBridge = new MochaBridge(log);

const m = new Mocha(mochaOptions);
const reporterInstance = new m._reporter(mochaBridge, mochaOptions);

runner.on('mocha-event', ev => {
  if (!ev) return;
  console.log("mocha-event", ev);
  mochaBridge.emit(ev.event, ev.data, ev.err);
});

runner.on('ended', stats => {
  code = stats.failures;
});

runner.on('failure', message => {
  code = 1;
});

runner.on('exit', () => process.exit(code));

(async function run () {
  await runner.connect();
  await runner.run();
})();
