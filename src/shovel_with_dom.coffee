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
  
format_result = ( code_result ) ->
  if !code_result?
    'undefined'
  else if !code_result.selector?
    return code_result
  else
    if code_result.length == 0
      "[]"
    else
      return ( -> 
        for node in code_result
        
          first_text_node = (child_node for child_node in node._childNodes when child_node._nodeName == '#text')[0]
        
          if first_text_node?
            inner_text = first_text_node._text
        
          node.outerHTML.replace(node.innerHTML, inner_text).trim()
      )().join(", ")
  
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
        
      if result.result? and result.failures?
        result.result = cycle.decycle(format_result(clean_result(result.result)))
      else
        result = cycle.decycle(format_result(clean_result(result)))
        
      return process.stdout.write JSON.stringify result: result, console: console

      
      

  catch e
    return process.stdout.write JSON.stringify result: e.message, console: console


stdin.on 'end', run