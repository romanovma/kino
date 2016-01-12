# Node does not have a define function, so we use amdefine
#if typeof define != 'function'
#  define = require('amdefine')(module)

# RequireJS implementation, works on Node as well as in the browser
#define (require) ->

React = require 'react'

module.exports = Welcome = React.createClass
  render: ->
    <div>
      'hello world'
    </div>
