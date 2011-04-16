fs = require 'fs'
path = require 'path'
spawn = require('child_process').spawn

class Sandbox
  constructor: (@options={}) -> 
    @options = Sandbox.options
  
  run: ( code, hollaback ) -> 
    child = spawn @options.node, [@options.shovel]
    
    stdout = ''
    
    output = ( data ) -> stdout += data if !!data
        
    # Listen
    child.stdout.on( 'data', output )
    child.on( 'exit', ( code ) -> 
      clearTimeout timer
      hollaback.call( this, JSON.parse( stdout ) )
    )
    
    # Go
    child.stdin.write code 
    child.stdin.end()
    
    timer = setTimeout -> 
      
      child.stdout.removeListener 'output', output
      stdout = JSON.stringify { result: 'TimeoutError', console: [] }
      child.kill 'SIGKILL'
      
    , @options.timeout 


# Options
Sandbox.options =
  timeout: 500
  node: 'node'
  shovel: path.join( __dirname, 'shovel.js' )

# Info
fs.readFile path.join( __dirname, '..', 'package.json' ), ( err, data ) -> 
  if err
    throw err
  else
    Sandbox.info = JSON.parse data


module.exports = Sandbox

