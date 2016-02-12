React = require 'react'
config = require '../../config.coffee'

module.exports = Movie = React.createClass

  componentDidMount: ->
    @hammer = Hammer @getDOMNode()
    @hammer.on('swipeleft', @handleSwipe)
    console.log @props.movie

  componentWillUnmount: ->
    @hammer.off('swipeleft', @handleSwipe)

  handleSwipe: ->
    console.log 'hello'

  renderSchedule: ->
    for cinema of config.cinemas
      <div className="cinema">{cinema}</div>

  render: ->
    <div className="movie">
      <div className="poster">
        <img src="#{@props.movie[0].movie_poster}" alt="#{@props.movie[0].movie_id}"/>
      </div>
      <div className="schedule">
        {@renderSchedule()}
      </div>
    </div>
