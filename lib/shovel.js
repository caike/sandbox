(function() {
  var Script, code, console, run, sandbox, stdin, util;
  util = require('util');
  Script = process.binding('evals').Script;
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
  code = '';
  stdin = process.openStdin();
  stdin.on('data', function(data) {
    return code += data;
  });
  run = function() {
    var output, result;
    result = (function() {
      try {
        return Script.runInNewContext(code.toString().replace(/\\([rn])/g, "\\\\$1"), sandbox);
      } catch (e) {
        return e.name + ': ' + e.message;
      }
    })();
    process.stdout.on('drain', function() {
      return process.exit(0);
    });
    if (typeof result === 'string') {
      output = util.inspect(result);
    } else {
      output = result;
    }
    return process.stdout.write(JSON.stringify({
      result: output,
      console: console
    }));
  };
  stdin.on('end', run);
}).call(this);
