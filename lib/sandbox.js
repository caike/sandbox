(function() {
  var Sandbox, fork, fs, path, underscore;

  fs = require('fs');

  path = require('path');

  fork = require('child_process').fork;

  underscore = require('underscore');

  Sandbox = (function() {

    function Sandbox(options) {
      this.options = options != null ? options : {};
      this.libs = options != null ? options.libs : void 0;
      this.coffeescript = options != null ? options.coffeescript : void 0;
      this.options = Sandbox.options;
    }

    Sandbox.prototype.runDOM = function(code, hollaback, context) {
      var child, message, output, timer;
      if (context == null) context = {};
      child = fork(this.options.shovel_with_dom);
      message = {};
      output = function(data) {
        return underscore.extend(message, data);
      };
      child.on('message', output);
      child.on('exit', function(code) {
        clearTimeout(timer);
        return hollaback.call(this, message);
      });
      child.send({
        code: code,
        html: context.html,
        libs: this.libs,
        coffee: this.coffeescript
      });
      child.send("done");
      return timer = setTimeout(function() {
        child.removeListener('message', output);
        message = {
          result: 'TimeoutError',
          console: []
        };
        return child.kill('SIGKILL');
      }, this.options.timeout);
    };

    Sandbox.prototype.run = function(code, hollaback) {
      var child, message, output, timer;
      child = fork(this.options.shovel);
      message = {};
      output = function(data) {
        return underscore.extend(message, data);
      };
      child.on('message', output);
      child.on('exit', function(code) {
        clearTimeout(timer);
        return hollaback.call(this, message);
      });
      child.send({
        code: code,
        coffee: this.coffeescript
      });
      child.send("done");
      return timer = setTimeout(function() {
        child.removeListener('message', output);
        message = {
          result: 'TimeoutError',
          console: []
        };
        return child.kill('SIGKILL');
      }, this.options.timeout);
    };

    return Sandbox;

  })();

  Sandbox.options = {
    timeout: 5000,
    node: 'node',
    shovel: path.join(__dirname, 'shovel.js'),
    shovel_with_dom: path.join(__dirname, 'shovel_with_dom.js')
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
