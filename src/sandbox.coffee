fs = require 'fs'
path = require 'path'
spawn = require('child_process').spawn
# cycle = require path.join( __dirname, 'cycle.js' )
# hello world

class Sandbox
  constructor: (@options={}) -> 
    @libs = options?.libs
    @coffeescript = options?.coffeescript
    @options = Sandbox.options
    
  runDOM: ( code, hollaback, context = {} ) -> 
    child = spawn @options.node, [@options.shovel_with_dom]

    stdout = ''

    output = ( data ) -> stdout += data if !!data

    # Listen
    child.stdout.on( 'data', output )
    child.on 'exit', ( code ) -> 
      clearTimeout timer

      resultObject = try 
        JSON.parse stdout
      catch err
        { result: err.message }
    
      hollaback.call this, resultObject

    # Go
    child.stdin.write JSON.stringify
      code: code
      html: context.html
      libs: @libs
      coffee: @coffeescript
      
    child.stdin.end()

    timer = setTimeout -> 

      child.stdout.removeListener 'output', output
      stdout = JSON.stringify { result: 'TimeoutError', console: [] }
      child.kill 'SIGKILL'

    , @options.timeout 
    
  
  run: ( code, hollaback ) -> 
    child = spawn @options.node, [@options.shovel]
    
    stdout = ''
    
    output = ( data ) -> stdout += data if !!data
        
    # Listen
    child.stdout.on( 'data', output )
    child.on( 'exit', ( code ) -> 
      clearTimeout timer

      resultObject = try 
        JSON.parse stdout
      catch err
        { result: err.message }

      hollaback.call this, resultObject
    )

    # Go
    child.stdin.write JSON.stringify
      code: code
      coffee: @coffeescript

    child.stdin.end()
    
    timer = setTimeout -> 
      
      child.stdout.removeListener 'output', output
      stdout = JSON.stringify { result: 'TimeoutError', console: [] }
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

