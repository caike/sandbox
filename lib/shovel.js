(function() {
  var code, comm, console, run, sandbox, underscore, util, vm;

  util = require('util');

  vm = require('vm');

  underscore = require("underscore");

  console = [];

  sandbox = {
    console: {
      log: function() {
        var argument, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = arguments.length; _i < _len; _i++) {
          argument = arguments[_i];
          _results.push(console.push(util.inspect(argument)));
        }
        return _results;
      }
    }
  };

  sandbox.print = sandbox.console.log;

  comm = function(m) {
    process.send(m);
    return process.exit();
  };

  code = {};

  process.on('message', function(message) {
    if (message === "done") {
      return run();
    } else {
      return underscore.extend(code, message);
    }
  });

  run = function() {
    var context, output, result;
    context = code;
    code = context.code;
    if (context.coffee != null) {
      sandbox.coffeeNodes = require('coffee-script').nodes(context.coffee);
    }
    result = (function() {
      try {
        return vm.runInNewContext(code.toString().replace(/\\([rn])/g, "\\\\$1"), sandbox);
      } catch (e) {
        return e.name + ': ' + e.message;
      }
    })();
    if (typeof result === 'string') {
      output = util.inspect(result);
    } else {
      output = result;
    }
    return comm({
      result: output,
      console: console
    });
  };

}).call(this);
