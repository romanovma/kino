React = require 'react'

module.exports = Main = React.createClass
  initialState: ->
    amount: 2

  componentDidMount: ->
    window.addEventListener 'scroll', @handleScroll

  componentWillUnmount: ->
    window.removeEventListener 'onScroll', @handleScroll

  handleScroll: (e)->

  distinctMovies: (movies) ->
    flags = []
    output = []
    i = 0
    while i < movies.length
      if flags[movies[i].movie_id]
        i++
        continue
      flags[movies[i].movie_id] = true
      output.push movies[i]
      i++
    output

  renderMovies: ->
    for movie in @distinctMovies @props.movies
      <div className="col s12 m6 l3 movie">
        <img src="#{movie.movie_poster}" alt="#{movie.movie_id}"/></div>

  render: ->
    <div className="row">
      {@renderMovies()}
    </div>
