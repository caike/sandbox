(function() {
  var clean_result, code, coffee, console, cycle, format_result, jsdom, path, run, sandbox, stdin, util, vm;
  util = require('util');
  vm = require('vm');
  jsdom = require('jsdom');
  path = require('path');
  coffee = require('coffee-script');
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
            _results.push(node.outerHTML.trim());
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
    var coffeeNodes, context, html, new_code;
    context = JSON.parse(code);
    html = context.html;
    new_code = context.code;
    if (context.coffee != null) {
      coffeeNodes = coffee.nodes(context.coffee);
    }
    try {
      return jsdom.env(html, context.libs, function(errors, window) {
        var result;
        try {
          result = vm.runInNewContext(new_code, {
            'window': window,
            'document': window.document,
            '$': window.$,
            'jQuery': window.$,
            'console': sandbox.console,
            'coffeeNodes': coffeeNodes
          });
        } catch (e) {
          result = [e.name, e.message].join(": ");
        }
        try {
          if ((result.result != null) && (result.failures != null)) {
            result.result = cycle.decycle(format_result(clean_result(result.result)));
          } else {
            result = cycle.decycle(format_result(clean_result(result)));
          }
          result.html = window.document.getElementsByTagName("body")[0].innerHTML;
        } catch (e) {
          result = [e.name, e.message].join(": ");
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
