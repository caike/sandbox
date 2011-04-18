util    = require( 'util' )
Script  = process.binding('evals').Script
jsdom   = require('jsdom')
path    = require 'path'
cycle   = require path.join( __dirname, 'cycle.js' )

console = []

sandbox =
  console:
    log: ->
        console.push util.inspect(argument) for argument in arguments

sandbox.print = sandbox.console.log;

# // Get code
code = ''
stdin = process.openStdin();

stdin.on 'data', ( data ) ->
  code += data
  
clean_result = ( obj ) ->
  try
    obj["0"]._attributes._ownerDocument._queue.tail.data = undefined;
    obj
  catch e
    obj

# // Run code
run = ->
  context   = JSON.parse code
  html      = context.html
  new_code  = context.code
  
  # process.stdout.on 'drain', ->
  #   process.exit 0

  try
    jsdom.env html, ['http://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js'], (errors, window) ->
      try
        result = Script.runInNewContext new_code, {'window': window}
      catch e
        result = e.message
      
      return process.stdout.write JSON.stringify result: cycle.decycle(clean_result(result)), console: console

  catch e
    return process.stdout.write JSON.stringify result: e.message, console: console


stdin.on 'end', run