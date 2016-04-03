r = require 'rethinkdb'
config = require './config'
http = require 'http'
https = require 'https'
reqPro = require 'request-promise'
async = require 'async'
promise = require 'bluebird'
fs = require 'fs'
ytdl = require 'ytdl-core'


#TODO: pass error down to middlewares


createConnection = (req, res, next) ->
  console.log 'creating connection to: ' + config.rethinkdb
  r.connect config.rethinkdb
  .then (connection) ->
    req._rdbConn = connection
    console.log 'connection created'
    next()
  .error (error) ->
    console.log error
    next()

closeConnection = (req, res, next) ->
  console.log 'closing rdb connection'
  req._rdbConn.close()
  console.log 'connection closed'
  next()

getMovies = (conn, next) ->
  r.table 'movies'
  .run conn
  .then (cursor) ->
    cursor.toArray()
  .finally(next)

getShowtimes =  (conn, movie_id, cinema, next) ->
  r.table('showtimes').
  filter({cinema: cinema, movie_id: movie_id}).
  concatMap((record) ->
    record('showtimes'))
  .distinct()
  .run(conn)
  .then (cursor) ->
    cursor.toArray()
  .finally(next)

updateSchedule =  (conn, next) ->
  logResult = []
  cinemas = []
  isUpdate = no
  # Get schedule
  for cinema of config.cinemas
    cinemas.push config.cinemas[cinema]
  promise.map cinemas, (cinema) ->
    path = config.api.theater + cinema + '/showtimes/'
    reqPro {uri: path, json: true}
    .then (showtimes) ->
      if showtimes.count > 0
        r.table('updates').filter({cinema: cinema}).run(conn)
        .then (cursor) ->
          cursor.toArray()
        .then (array) ->
          oldDate = array[0]?.lastUpdate
          newDate = showtimes.results.reduce((max, current) ->
            return if max.updated_on < current.updated_on then current else max)
            .updated_on
          # if not(oldDate?) or (oldDate isnt newDate)
            isUpdate = yes
            schedule = showtimes.results.filter (result) ->
              (result.audio.indexOf('en') > -1 or result.caption.indexOf('en') > -1) and result.cinema isnt 'F' and result.extra isnt 'Ultra;Screen' and result.extra isnt 'type-4dx;4DX'
            .map (result) ->
              result.cinema = cinema.toString()
              result
            r.table('showtimes').filter({cinema: cinema}).delete().run(conn)
            .then (result) ->
              logResult.push result
              r.table('showtimes').insert(schedule).run(conn)
            .then (result) ->
              logResult.push result
              r.table('updates').filter({cinema: cinema}).update({lastUpdate: newDate}).run(conn)
            .then (result) ->
              logResult.push result
          # else
          #   return
      else
        console.log path + '--- empty'
  # Get movie info
  .then ->
    if isUpdate
      r.table('movies').delete().run(conn)
      .then ->
        r.table('showtimes').pluck("movie_id").distinct().run(conn)
      .then (cursor) ->
        cursor.toArray()
      .then (result) ->
        promise.map result, (movie) ->
          path = config.api.movie + movie.movie_id + '/'
          reqPro {uri: path, json: true}
          .then (movieInfo) ->
            r.table('movies').insert(movieInfo).run(conn)
          .then ->
            promise.map cinemas, (cinema) ->
              getShowtimes conn, movie.movie_id, cinema
              .then (result) ->
                r.table('movies').filter({ id: movie.movie_id })
                .update({ showtimes: r.object(cinema, result) })
                .run(conn)
  # Save posters
  .then ->
    if isUpdate
      r.table('showtimes').pluck("movie_id").distinct().run(conn)
      .then (cursor) ->
        cursor.toArray()
      .then (result) ->
        promise.map result, (movie) ->
          if !fs.existsSync './build/images/' + movie.movie_id + '.jpg'
            file = fs.createWriteStream('./build/images/' + movie.movie_id + '.jpg');
            r.table('showtimes').filter({movie_id: movie.movie_id}).run(conn)
            .then (cursor) ->
              cursor.toArray()
            .then (result) ->
              module = if result[0].movie_poster.substring(0,5) == 'https' then https else http
              request = module.get result[0].movie_poster, (response) ->
                response.pipe file
  # Save trailers
    if isUpdate
      r.table('showtimes').pluck("movie_id").distinct().run(conn)
      .then (cursor) ->
        cursor.toArray()
      .then (result) ->
        promise.map result, (movie) ->
          if !fs.existsSync './build/trailers/' + movie.movie_id + '.mp4'
            r.table('movies').filter({id: movie.movie_id}).run(conn)
            .then (cursor) ->
              cursor.toArray()
            .then (result) ->
              if result[0].videos[0]?
                url = result[0].videos[0].url
                ytdl(url, filter: (format) ->
                  format.container == 'mp4' and format.resolution == '360p')
                .pipe fs.createWriteStream('./build/trailers/' + result[0].id + '-0.mp4')
                .on 'finish', ->
                  console.log result[0].id + ' video downloaded'
              if result[0].videos[1]?
                url = result[0].videos[1].url
                ytdl(url, filter: (format) ->
                  format.container == 'mp4' and format.resolution == '360p')
                .pipe fs.createWriteStream('./build/trailers/' + result[0].id + '-1.mp4')
                .on 'finish', ->
                  console.log result[0].id + ' video downloaded'
  .then ->
    logResult
  .finally next

module.exports =
  createConnection: createConnection
  closeConnection: closeConnection
  getMovies: getMovies
  updateSchedule: updateSchedule
