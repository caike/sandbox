util = require( 'util' )
Script = process.binding('evals').Script

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

# // Run code
run = ->
  result = (->
    try 
      return Script.runInNewContext code.toString().replace( /\\([rn])/g, "\\\\$1" ), sandbox
    catch e
      e.name + ': ' + e.message
  )();
  
  process.stdout.on 'drain', ->
    process.exit 0

  if typeof result == 'string'
    output = util.inspect(result)
  else
    output = result
    
  process.stdout.write JSON.stringify
    result: output
    console: console

stdin.on 'end', run