(function() {
  var Script, clean_result, code, console, cycle, format_result, jsdom, path, run, sandbox, stdin, util;
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
  format_result = function(code_result) {
    if (!(code_result != null)) {
      return 'undefined';
    } else if (!(code_result.selector != null)) {
      return code_result;
    } else {
      if (code_result.length === 0) {
        return "[]";
      } else {
        return (function() {
          var child_node, first_text_node, inner_text, node, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = code_result.length; _i < _len; _i++) {
            node = code_result[_i];
            first_text_node = ((function() {
              var _i, _len, _ref, _results;
              _ref = node._childNodes;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                child_node = _ref[_i];
                if (child_node._nodeName === '#text') {
                  _results.push(child_node);
                }
              }
              return _results;
            })())[0];
            if (first_text_node != null) {
              inner_text = first_text_node._text;
            }
            _results.push(node.outerHTML.replace(node.innerHTML, inner_text).trim());
          }
          return _results;
        })().join(", ");
      }
    }
  };
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
            'window': window,
            '$': window.$,
            'jQuery': window.$
          });
        } catch (e) {
          result = e.message;
        }
        if ((result.result != null) && (result.failures != null)) {
          result.result = cycle.decycle(format_result(clean_result(result.result)));
        } else {
          result = cycle.decycle(format_result(clean_result(result)));
        }
        return process.stdout.write(JSON.stringify({
          result: result,
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
