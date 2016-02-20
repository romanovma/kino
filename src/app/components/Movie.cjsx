React = require 'react'
config = require '../../config.coffee'
moment = require 'moment'
tz = require 'moment-timezone'

module.exports = Movie = React.createClass

  getInitialState: ->
    view: 'poster'

  componentDidMount: ->
    @hammer = Hammer @getDOMNode()
    @hammer.on('swipeleft', @handleSwipe)
    @hammer.on('swiperight', @handleSwipe)

  componentWillUnmount: ->
    @hammer.off('swipeleft', @handleSwipe)
    @hammer.off('swiperight', @handleSwipe)

  handleSwipe: ->
    @setState
      view: if @state.view is 'poster' then 'description' else 'poster'

  getMinutes: (time)->
    time.substring(0,2) * 60 + time.substring(3,5) * 1 - 600

  getShowtimes: (cinema) ->
    showtimes = []
    @props.movieData
    .filter (record) ->
      config.cinemas[cinema] is record.cinema and record.extra isnt 'Ultra;Screen' and record.extra isnt 'type-4dx;4DX'
    .forEach (record, i, arr) ->
      showtimes = showtimes.concat record.showtimes
    showtimes.sort()
    showtimes

  renderSchedule: ->
    for cinema of config.cinemas
      <div className="cinema">
        {@renderScheduleCinema cinema}
      </div>

  renderScheduleCinema: (cinema) ->
    showtimes = @getShowtimes cinema
    small = if showtimes.length > 10 then ' small' else ''
    for time in showtimes
      <div className="time#{small}" style={{top: 0.5 * @getMinutes(time)}}>{time}</div>


  findClosest: (cinema) ->
    showtimes = @getShowtimes cinema
    i = 0
    max = '00:00'
    now = moment().tz('Asia/Bangkok').format('HH:mm')
    while i < showtimes.length and max is '00:00'
      if showtimes[i] >= now
        max = showtimes[i]
        break
      i++
    if max is '00:00' then '-' else max

  renderClosest: ->
    for cinema of config.cinemas
      <div className="closest">
        {@findClosest cinema}
      </div>

  renderCinemas: ->
    for cinema of config.cinemas
      <div className="label">
        {cinema}
      </div>

  renderMain: ->
    if @state.view is 'description'
      <div className="description">
        'description'
      </div>
    else
      <div className="poster">
        <img src="#{@props.movieData[0].movie_poster}" alt="#{@props.movieData[0].movie_id}"/>
      </div>


  render: ->
    <div className="movie">
      <div className="main">
        {@renderMain()}
      </div>
      {@renderCinemas()}
      <div className="schedule">
        {@renderSchedule()}
      </div>
    </div>
