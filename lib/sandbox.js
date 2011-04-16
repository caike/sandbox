(function() {
  var Sandbox, fs, path, spawn;
  fs = require('fs');
  path = require('path');
  spawn = require('child_process').spawn;
  Sandbox = (function() {
    function Sandbox(options) {
      this.options = options != null ? options : {};
      this.options = Sandbox.options;
    }
    Sandbox.prototype.run = function(code, hollaback) {
      var child, output, stdout, timer;
      child = spawn(this.options.node, [this.options.shovel]);
      stdout = '';
      output = function(data) {
        if (!!data) {
          return stdout += data;
        }
      };
      child.stdout.on('data', output);
      child.on('exit', function(code) {
        clearTimeout(timer);
        return hollaback.call(this, JSON.parse(stdout));
      });
      child.stdin.write(code);
      child.stdin.end();
      return timer = setTimeout(function() {
        child.stdout.removeListener('output', output);
        stdout = JSON.stringify({
          result: 'TimeoutError',
          console: []
        });
        return child.kill('SIGKILL');
      }, this.options.timeout);
    };
    return Sandbox;
  })();
  Sandbox.options = {
    timeout: 500,
    node: 'node',
    shovel: path.join(__dirname, 'shovel.js')
  };
  fs.readFile(path.join(__dirname, '..', 'package.json'), function(err, data) {
    if (err) {
      throw err;
    } else {
      return Sandbox.info = JSON.parse(data);
    }
  });
  module.exports = Sandbox;
}).call(this);
