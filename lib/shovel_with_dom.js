(function() {
  var clean_result, code, comm, console, cycle, format_result, jsdom, path, run, sandbox, underscore, util, vm;

  util = require('util');

  vm = require('vm');

  jsdom = require('jsdom');

  path = require('path');

  underscore = require("underscore");

  cycle = require(path.join(__dirname, 'cycle.js'));

  console = [];

  comm = function(m) {
    process.send(m);
    return process.exit();
  };

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

  code = {};

  process.on('message', function(message) {
    if (message === "done") {
      return run();
    } else {
      return underscore.extend(code, message);
    }
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
              var _j, _len2, _ref, _results2;
              _ref = node._childNodes;
              _results2 = [];
              for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
                child_node = _ref[_j];
                if (child_node._nodeName === '#text') _results2.push(child_node);
              }
              return _results2;
            })())[0];
            if (first_text_node != null) inner_text = first_text_node._text;
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
    context = code;
    html = context.html;
    new_code = context.code;
    try {
      if (context.coffee != null) {
        coffeeNodes = require('coffee-script').nodes(context.coffee);
      }
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
        return comm({
          result: result,
          console: console
        });
      });
    } catch (e) {
      return comm({
        result: e.message,
        console: console
      });
    }
  };

}).call(this);
