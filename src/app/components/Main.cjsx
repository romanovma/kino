React = require 'react'
Movie = require './Movie.cjsx'

module.exports = Main = React.createClass
  #getInitialState: ->

  distinctMovies: (movies) ->
    output = {}
    i = 0
    while i < movies.length
      movieId = movies[i].movie_id
      if not output[movieId]
        output[movieId] = []
      output[movieId].push movies[i]
      i++
    output

  renderMovies: ->
    distMovies = @distinctMovies @props.movies
    for movie of distMovies
      if distMovies.hasOwnProperty(movie)
        <div className="col s12 movie-wrapper">
          <Movie movieData={distMovies[movie]} />
        </div>

  render: ->
    <div className="row">
      {@renderMovies()}
    </div>
