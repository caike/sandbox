util    = require( 'util' )
vm      = require('vm')
jsdom   = require('jsdom')
path    = require 'path'
underscore = require "underscore"
cycle   = require path.join( __dirname, 'cycle.js' )

console = []

comm = (m) ->
  process.send m
  process.exit()

sandbox =
  console:
    log: ->
        console.push util.inspect(argument) for argument in arguments

sandbox.print = sandbox.console.log;

code = {}

process.on 'message', ( message ) ->
  if message == "done"
    run()
  else
    underscore.extend code, message
  
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
        
          node.outerHTML.trim()
      )().join(", ")
  
clean_result = ( obj ) ->
  try
    obj["0"]._attributes._ownerDocument._queue.tail.data = undefined;
    obj
  catch e
    obj

# // Run code
run = ->
  context   = code
  html      = context.html
  new_code  = context.code

  try
    coffeeNodes = require('coffee-script').nodes(context.coffee) if context.coffee?

    jsdom.env html, context.libs, (errors, window) ->
      try
        result = vm.runInNewContext new_code,
          'window': window
          'document': window.document
          '$': window.$
          'jQuery': window.$
          'console': sandbox.console
          'coffeeNodes': coffeeNodes
      catch e
        result = [e.name, e.message].join(": ")

      try
        if result.result? and result.failures?
          result.result = cycle.decycle(format_result(clean_result(result.result)))
        else
          result = cycle.decycle(format_result(clean_result(result)))

        result.html = window.document.getElementsByTagName("body")[0].innerHTML
      catch e
        result = [e.name, e.message].join(": ")

      return comm(result: result, console: console)


  catch e
    return comm(result: e.message, console: console)
