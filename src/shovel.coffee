util = require( 'util' )
vm = require('vm')
underscore = require "underscore"

console = []

sandbox =
  console:
    log: ->
        console.push util.inspect(argument) for argument in arguments

sandbox.print = sandbox.console.log;

comm = (m) ->
  process.send m
  process.exit()

# // Get code
code = {}

process.on 'message', ( message ) ->
  if message == "done"
    run()
  else
    underscore.extend code, message

# // Run code
run = ->
  context = code
  code = context.code
  sandbox.coffeeNodes = require('coffee-script').nodes(context.coffee) if context.coffee?

  result = (->
    try 
      return vm.runInNewContext code.toString().replace( /\\([rn])/g, "\\\\$1" ), sandbox
    catch e
      e.name + ': ' + e.message
  )();
  
  if typeof result == 'string'
    output = util.inspect(result)
  else
    output = result
    
  comm
    result: output
    console: console

