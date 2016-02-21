React = require 'react'
ReactSwipe = require 'react-swipe'
config = require '../../config.coffee'
moment = require 'moment'
tz = require 'moment-timezone'

module.exports = Movie = React.createClass

  height: 420
  topPadding: 600
  pixelPerMinute: 0.5

  componentDidMount: ->
    height = React.findDOMNode(@refs.main).clientHeight + 'px'
    React.findDOMNode(@refs.description).style.height = height
    React.findDOMNode(@refs.trailers).style.height = height

  componentWillMount: ->
    @calcSizes()

  calcSizes: ->
    obj = @props.movieData.showtimes
    showtimes = Object.keys(obj)
    .reduce ((result, value) ->
      result.concat obj[value]
    ), []
    .sort()
    if showtimes.length
      @topPadding = @getMinutes(showtimes[0]) - 60
      @height = @getMinutes(showtimes[showtimes.length - 1]) - @getMinutes(showtimes[0]) + 180
    if @checkGap()
      @pixelPerMinute = 0.7

  checkGap: ->
    result = no
    that = this
    for cinema of config.cinemas
      if @props.movieData.showtimes[config.cinemas[cinema].toString()].length
        @props.movieData.showtimes[config.cinemas[cinema].toString()]
        .reduce (previous, next) ->
          if that.getMinutes(next) - that.getMinutes(previous) <= 20
            result = yes
          next
    result

  # findClosest: (cinema) ->
  #   showtimes = @getShowtimes cinema
  #   i = 0
  #   max = '00:00'
  #   now = moment().tz('Asia/Bangkok').format('HH:mm')
  #   while i < showtimes.length and max is '00:00'
  #     if showtimes[i] >= now
  #       max = showtimes[i]
  #       break
  #     i++
  #   if max is '00:00' then '-' else max
  #
  # renderClosest: ->
  #   for cinema of config.cinemas
  #     <div className="closest">
  #       {@findClosest cinema}
  #     </div>



  # Helpers
  getDetail: (field) ->
    value = ''
    for lang of @props.movieData.details
      if @props.movieData.details[lang.toString()].language is 'en'
        value = @props.movieData.details[lang.toString()][field]
    if value == ''
      value = @props.movieData.details['0'][field]
    value

  getMinutes: (time)->
    time.substring(0,2) * 60 + time.substring(3,5) * 1

  # Render
  renderSecondTrailer: ->
    if @props.movieData.videos['1']?
      videoUrl2 = '{ "techOrder": ["youtube"], "sources": [{ "type": "video/youtube", "src": "' + @props.movieData.videos['1'].url + '"}] }'
      <div className="video-wrapper">
        <video id="#{@props.movieData.id}-2" className="video-js vjs-default-skin" controls preload="none" data-setup={videoUrl2}>
          <p className="vjs-no-js">
            To view this video please enable JavaScript, and consider upgrading to a web browser that
            <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
          </p>
        </video>
      </div>
    else


  renderMain: ->
    videoUrl1 = videoUrl2 = '{ "techOrder": ["youtube"], "sources": [{ "type": "video/youtube", "src": "' + @props.movieData.videos['0'].url + '"}] }'
    if @props.movieData.videos['1']?
      videoUrl2 = '{ "techOrder": ["youtube"], "sources": [{ "type": "video/youtube", "src": "' + @props.movieData.videos['1'].url + '"}] }'
    <ReactSwipe>
      <div className="poster">
        <img ref="img" src="../images/#{@props.movieData.id}.jpg" alt={@getDetail 'storyline'}/>
      </div>
      <div className="description" ref="description">
        <div className="title">{@getDetail 'title'}</div>
        <div className="director">{@getDetail 'director'}</div>
        <div className="cast">{@getDetail 'cast'}</div>
        <div className="storyline">{@getDetail 'storyline'}</div>
      </div>
      <div ref='trailers' className="trailers">
        <div className="align-vertically">
          <div className="video-wrapper">
            <video id="#{@props.movieData.id}-1" className="video-js vjs-default-skin" controls preload="none" data-setup={videoUrl1}>
              <p className="vjs-no-js">
                To view this video please enable JavaScript, and consider upgrading to a web browser that
                <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
              </p>
            </video>
          </div>
          {@renderSecondTrailer()}
        </div>
      </div>
    </ReactSwipe>

  renderCinemas: ->
    for cinema of config.cinemas
      hidden = if @props.movieData.showtimes[config.cinemas[cinema].toString()].length == 0 then ' hidden' else ''
      <div key={cinema} className="cinema-label#{hidden}">
        {cinema}
      </div>

  renderSchedule: ->
    for cinema of config.cinemas
      <div key={cinema} className="cinema" style={{height: @pixelPerMinute * @height}}>
        {@renderScheduleCinema cinema}
      </div>

  renderScheduleCinema: (cinema) ->
    showtimes = @props.movieData.showtimes[config.cinemas[cinema].toString()]
    for time in showtimes
      <div key={time} className="time" style={{top: @pixelPerMinute * (@getMinutes(time) - @topPadding)}}>{time}</div>

  render: ->
    <div className="movie">
      <div className="main" ref="main">
        {@renderMain()}
      </div>
      {@renderCinemas()}
      <div className="schedule">
        {@renderSchedule()}
      </div>
    </div>
