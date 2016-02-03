React = require 'react'
Main = require './Main.cjsx'

module.exports = App = React.createClass
  render: ->
    <Main movies={@props.movies} />
