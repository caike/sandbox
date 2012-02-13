fs = require 'fs'
path = require 'path'
fork = require('child_process').fork
underscore = require 'underscore'
# cycle = require path.join( __dirname, 'cycle.js' )
# hello world

class Sandbox
  constructor: (@options={}) -> 
    @libs = options?.libs
    @coffeescript = options?.coffeescript
    @options = Sandbox.options
    
  runDOM: ( code, hollaback, context = {} ) -> 
    child = fork @options.shovel_with_dom

    message = {}

    output = ( data ) -> 
      underscore.extend message, data

    # Listen
    child.on( 'message', output )
    child.on 'exit', ( code ) -> 
      clearTimeout timer
      hollaback.call this, message

    # Go
    child.send
      code: code
      html: context.html
      libs: @libs
      coffee: @coffeescript
      
    child.send "done"

    timer = setTimeout -> 

      child.removeListener 'message', output
      message = { result: 'TimeoutError', console: [] }
      child.kill 'SIGKILL'

    , @options.timeout 
    
  
  run: ( code, hollaback ) -> 
    child = fork @options.shovel
    
    message = {}
    
    output = ( data ) -> 
      underscore.extend message, data
        
    # Listen
    child.on 'message', output
    child.on 'exit', (code) -> 
      clearTimeout timer
      hollaback.call this, message
    

    # Go
    child.send
      code: code
      coffee: @coffeescript

    child.send "done"
    
    timer = setTimeout -> 
      
      child.removeListener 'message', output
      message = { result: 'TimeoutError', console: [] }
      child.kill 'SIGKILL'
      
    , @options.timeout 


# Options
Sandbox.options =
  timeout: 5000
  node: 'node'
  shovel: path.join( __dirname, 'shovel.js' )
  shovel_with_dom: path.join( __dirname, 'shovel_with_dom.js' )

# Info
fs.readFile path.join( __dirname, '..', 'package.json' ), ( err, data ) -> 
  if err
    throw err
  else
    Sandbox.info = JSON.parse data


module.exports = Sandbox

