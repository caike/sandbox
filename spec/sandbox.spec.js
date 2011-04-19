/* ------------------------------ INIT ------------------------------ */
var Sandbox = require( '../lib/sandbox' )
  , sb = new Sandbox()

/* ------------------------------ Tests ------------------------------ */
exports['it should execute basic javascript'] = function( test ) {
  sb.run( '1 + 1', function( output ) {
    test.equal( output.result, '2' )
    test.finish()
  })
}

exports['it should gracefully handle syntax errors'] = function( test ) {
  sb.run( 'hi )there', function( output ) {
    test.equal( output.result, "'SyntaxError: Unexpected token )'" )
    test.finish()
  })
}

exports['it should effectively prevent code from accessing node'] = function( test ) {
  sb.run( 'process.platform', function( output ) {
    test.equal( output.result, "'ReferenceError: process is not defined'" )
    test.finish()
  })
}

exports['it should effectively prevent code from circumventing the sandbox'] = function( test ) {
  sb.run( "var sys=require('sys'); sys.puts('Up in your fridge')", function( output ) {
    test.equal( output.result, "'ReferenceError: require is not defined'" )
    test.finish()
  })
}

exports['it should timeout on infinite loops'] = function( test ) {
  sb.run( 'while ( true ) {}', function( output ) {
    test.equal( output.result, "TimeoutError" )
    test.finish()
  })
}

exports['it should allow console output via `console.log`'] = function( test ) {
  sb.run( 'console.log(7); 42', function( output ) {
    test.equal( output.result, "42" )
    test.equal( output.console[0], "7" )
    test.finish()
  })
}

exports['it should allow console output via `print`'] = function( test ) {
  sb.run( 'print(7); 42', function( output ) {
    test.equal( output.result, "42" )
    test.equal( output.console[0], "7" )
    test.finish()
  })
}

exports['it should maintain the order of sync. console output'] = function( test ) {
  sb.run( 'console.log("first"); console.log("second"); 42', function( output ) {
    test.equal( output.result, "42" )
    test.equal( output.console[0], "'first'" )
    test.equal( output.console[1], "'second'" )
    test.finish()
  })
}

exports['it should output object if result is not string'] = function( test ) {
  sb.run("(function(){ return { name: 'Caike', age: 26} })();", function( output ) {
    test.equal(typeof output.result, 'object');
    test.equal(output.result.name, 'Caike' );
    test.equal(output.result.age, 26 );
    test.finish();
  });
};

exports['it should allow running against a DOM'] = function(test) {
  sb.runDOM("window.$('h1').html();", function( output ) {
    test.equal(output.result, 'BLA')
    test.finish();
  }, { html: '<h1>BLA</h1>' });
}

exports['it should format the result of a jquery object into a string'] = function(test) {
  sb.runDOM("window.$('h1')", function( output ) {
    test.equal(typeof output.result, 'string');
    test.equal(output.result, '<h1>BLA</h1>');
    test.finish();
  }, { html: '<h1>BLA</h1>' });
}

exports['it should expect the code to return an object with result and failures'] = function(test) {
  sb.runDOM("(function() { var r = window.$('h1'); return {result: r, failures: []} })()", function( output ) {
    test.equal(typeof output.result, 'object');
    test.equal(output.result.result, '<h1>BLA</h1>');
    test.finish();
  }, { html: '<h1>BLA</h1>' });
}

exports['it should allow getting the outerHTML'] = function(test) {
  sb.runDOM("window.$('h1')[0].outerHTML", function( output ) {
    test.equal(typeof output.result, 'string');
    test.equal(output.result.trim(), '<h1>BLA</h1>');
    test.finish();
  }, { html: '<h1>BLA</h1>' });
}

/* ------------------------------ GO GO GO ------------------------------ */
if ( module == require.main )
  require( 'async_testing' ).run( __filename, process.ARGV )

