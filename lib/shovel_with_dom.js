(function() {
  var Script, clean_result, code, console, cycle, jsdom, path, run, sandbox, stdin, util;
  util = require('util');
  Script = process.binding('evals').Script;
  jsdom = require('jsdom');
  path = require('path');
  cycle = require(path.join(__dirname, 'cycle.js'));
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
  clean_result = function(obj) {
    try {
      obj["0"]._attributes._ownerDocument._queue.tail.data = void 0;
      return obj;
    } catch (e) {
      return obj;
    }
  };
  run = function() {
    var context, html, new_code;
    context = JSON.parse(code);
    html = context.html;
    new_code = context.code;
    try {
      return jsdom.env(html, ['http://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js'], function(errors, window) {
        var result;
        try {
          result = Script.runInNewContext(new_code, {
            'window': window
          });
        } catch (e) {
          result = e.message;
        }
        return process.stdout.write(JSON.stringify({
          result: cycle.decycle(clean_result(result)),
          console: console
        }));
      });
    } catch (e) {
      return process.stdout.write(JSON.stringify({
        result: e.message,
        console: console
      }));
    }
  };
  stdin.on('end', run);
}).call(this);
