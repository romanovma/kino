React = require 'react'
Movie = require './Movie.cjsx'

module.exports = Main = React.createClass

  renderMovies: ->
    for movie of @props.movies
      <div key={@props.movies[movie].id} className="col s12 movie-wrapper">
        <Movie movieData={@props.movies[movie]} />
      </div>

  render: ->
    <div className="row">
      {@renderMovies()}
    </div>
