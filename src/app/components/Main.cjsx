React = require 'react'

module.exports = Main = React.createClass
  #getInitialState: ->

  componentDidMount: ->
    @hammer = Hammer @getDOMNode()
    @hammer.on('swipeleft', @handleSwipe)

  componentWillUnmount: ->
    @hammer.off('swipeleft', @handleSwipe)

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

  handleSwipe: ->
    console.log 'hello'

  renderMovies: ->
    for movie in @distinctMovies @props.movies
      <div className="col s12 movie">
        <img src="#{movie.movie_poster}" alt="#{movie.movie_id}"/>
      </div>

  render: ->
    <div className="row">
      {@renderMovies()}
    </div>
