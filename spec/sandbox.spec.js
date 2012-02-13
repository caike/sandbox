/* ------------------------------ INIT ------------------------------ */
var default_libs = ["http://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js"];
var jquery_1_5_libs = default_libs
var jquery_1_6_libs = ["http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"];

var Sandbox = require( '../lib/sandbox' )
  , sb = new Sandbox({libs: default_libs})

// /* ------------------------------ Tests ------------------------------ */
exports['it should execute basic javascript'] = function( test ) {
  test.expect(1);

  sb.run( '1 + 1', function( output ) {
    test.equal( output.result, '2' )
    test.done()
  })
}

exports['it should gracefully handle syntax errors'] = function( test ) {
  test.expect(1);

  sb.run( 'hi )there', function( output ) {
    test.equal( output.result, "'SyntaxError: Unexpected token )'" )
    test.done()
  })
}

exports['it should effectively prevent code from accessing node'] = function( test ) {
  test.expect(1);

  sb.run( 'process.platform', function( output ) {
    test.equal( output.result, "'ReferenceError: process is not defined'" )
    test.done()
  })
}

exports['it should effectively prevent code from circumventing the sandbox'] = function( test ) {
  test.expect(1);

  sb.run( "var sys=require('sys'); sys.puts('Up in your fridge')", function( output ) {
    test.equal( output.result, "'ReferenceError: require is not defined'" )
    test.done()
  })
}

exports['it should timeout on infinite loops'] = function( test ) {
  test.expect(1);

  sb.run( 'while ( true ) {}', function( output ) {
    test.equal( output.result, "TimeoutError" )
    test.done()
  })
}

exports['it should allow console output via `console.log`'] = function( test ) {
  test.expect(2);

  sb.run( 'console.log(7); 42', function( output ) {
    test.equal( output.result, "42" )
    test.equal( output.console[0], "7" )
    test.done()
  })
}

exports['it should allow console output via `print`'] = function( test ) {
  test.expect(2);

  sb.run( 'print(7); 42', function( output ) {
    test.equal( output.result, "42" )
    test.equal( output.console[0], "7" )
    test.done()
  })
}

exports['it should maintain the order of sync. console output'] = function( test ) {
  test.expect(3);

  sb.run( 'console.log("first"); console.log("second"); 42', function( output ) {
    test.equal( output.result, "42" )
    test.equal( output.console[0], "'first'" )
    test.equal( output.console[1], "'second'" )
    test.done()
  })
}

exports['it should output object if result is not string'] = function( test ) {
  test.expect(3);

  sb.run("(function(){ return { name: 'Caike', age: 26} })();", function( output ) {
    test.equal(typeof output.result, 'object');
    test.equal(output.result.name, 'Caike' );
    test.equal(output.result.age, 26 );
    test.done();
  });
};

exports['it should allow running against a DOM'] = function(test) {
  test.expect(1);

  sb.runDOM("window.$('h1').html();", function( output ) {
    test.equal(output.result, 'BLA')
    test.done();
  }, { html: '<h1>BLA</h1>' });
}

exports['it should format the result of a jquery object into a string'] = function(test) {
  test.expect(2);

  sb.runDOM("window.$('h1')", function( output ) {
    test.equal(typeof output.result, 'string');
    test.equal(output.result, '<h1>BLA</h1>');
    test.done();
  }, { html: '<h1>BLA</h1>' });
}

exports['it should expect the code to return an object with result and failures'] = function(test) {
  test.expect(2);

  sb.runDOM("(function() { var r = window.$('h1'); return {result: r, failures: []} })()", function( output ) {
    test.equal(typeof output.result, 'object');
    test.equal(output.result.result, '<h1>BLA</h1>');
    test.done();
  }, { html: '<h1>BLA</h1>' });
}

exports['it should allow getting the outerHTML'] = function(test) {
  test.expect(2);

  sb.runDOM("window.$('h1')[0].outerHTML", function( output ) {
    test.equal(typeof output.result, 'string');
    test.equal(output.result.trim(), '<h1>BLA</h1>');
    test.done();
  }, { html: '<h1>BLA</h1>' });
}

exports['it should allow access to $'] = function(test) {
  test.expect(2);

  sb.runDOM("$('h1')[0].outerHTML", function( output ) {
    test.equal(typeof output.result, 'string');
    test.equal(output.result.trim(), '<h1>BLA</h1>');
    test.done();
  }, { html: '<h1>BLA</h1>' });
}

exports['it should return modified html'] = function(test) {
  test.expect(1);

  sb.runDOM("(function() { var r = $('h1').addClass('hello'); return {result: r, failures: []} })()", function( output ) {
    test.equal(output.result.html.trim(), '<h1 class="hello">BLA</h1>');
    test.done();
  }, { html: '<h1>BLA</h1>' });
}

exports['it should allow access to jQuery'] = function(test) {
  test.expect(2);

  sb.runDOM("jQuery('h1')[0].outerHTML", function( output ) {
    test.equal(typeof output.result, 'string');
    test.equal(output.result.trim(), '<h1>BLA</h1>');
    test.done();
  }, { html: '<h1>BLA</h1>' });
}

exports['it should allow setting js libraries to use'] = function(test) {
  var sandbox_1_5 = new Sandbox({libs: jquery_1_5_libs});
  var sandbox_1_6 = new Sandbox({libs: jquery_1_6_libs});

  test.expect(4);
  
  sandbox_1_5.runDOM("jQuery.fn.jquery", function( output ) {
    test.equal(typeof output.result, 'string');
    test.equal(output.result.trim(), '1.5.2');

    sandbox_1_6.runDOM("jQuery.fn.jquery", function( output ) {
      test.equal(typeof output.result, 'string');
      test.equal(output.result.trim(), '1.6.2');
      test.done();
    }, { html: '<h1>BLA</h1>' });

  }, { html: '<h1>BLA</h1>' });
  
}

exports['it should allow setting no libs'] = function(test) {
  var sandbox_libless = new Sandbox();
  test.expect(1);
  
  sandbox_libless.runDOM("1 + 1", function( output ) {
    test.equal(output.result, 2);
    test.done();
  }, { html: '<h1>BLA</h1>' });
}

exports['it should accept a coffeescript option and expose the coffee nodes to the sandbox on runDom'] = function(test) {
  var sandbox_with_coffee = new Sandbox({coffeescript: 'hello name'});

  test.expect(1)
  
  sandbox_with_coffee.runDOM("coffeeNodes.compile()", function( output ) {
    test.ok(/hello\(name\)/.test(output.result.trim()));
    test.done();
  }, { html: '<h1>BLA</h1>' });

}

exports['it should accept a coffeescript option and expose the coffee nodes to the sandbox on run'] = function(test) {
  var sandbox_with_coffee = new Sandbox({coffeescript: 'hello name'});

  test.expect(1);

  sandbox_with_coffee.run( 'coffeeNodes.compile()', function( output ) {
    test.ok( /hello\(name\)/.test(output.result.trim()) )
    test.done()
  })
}
exports['it should set the jQuery version to 1.5.2 by default'] = function(test) {
  test.expect(2);

  sb.runDOM("jQuery.fn.jquery", function( output ) {
    test.equal(typeof output.result, 'string');
    test.equal(output.result.trim(), '1.5.2');
    test.done();
  }, { html: '<h1>BLA</h1>' });
}
