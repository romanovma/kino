r = require 'rethinkdb'
config = require './config'
http = require 'http'
reqPro = require 'request-promise'
async = require 'async'
promise = require 'bluebird'


#TODO: pass error down to middlewares

module.exports =
  createConnection: (req, res, next) ->
    console.log config.rethinkdb
    r.connect config.rethinkdb
    .then (connection) ->
      req._rdbConn = connection
      next()
    .error (error) ->
      console.log error
      next()

  closeConnection: (req, res, next) ->
    req._rdbConn.close()
    next()

  getMovies: (conn, next) ->
    r.table 'movies'
    .run conn
    .then (cursor) ->
      cursor.toArray()
    .finally(next)

  updateSchedule: (conn, next) ->
    finResult = []
    cinemas = []
    for cinema of config.cinemas
      cinemas.push config.cinemas[cinema]
    promise.map(cinemas, (cinema) ->
      path = config.api.theater + cinema + '/showtimes/'
      reqPro {uri: path, json: true}
      .then (showtimes) ->
        r.table('updates').filter({cinema: cinema.toString()}).run(conn)
        .then (cursor) ->
          oldDate = ''
          cursor.toArray().then (array) ->
            oldDate = array[0]?.lastUpdate
            console.log oldDate
          newDate = showtimes.results.reduce((max, current) ->
            return if max.updated_on < current.updated_on then current else max).updated_on
          console.log 'old: ' + oldDate
          console.log 'new: ' + newDate
          if not(oldDate?) or (oldDate isnt newDate)
            schedule = showtimes.results.filter((result) ->
              result.audio.indexOf('en') > -1 or result.caption.indexOf('en') > -1
            ).map((result) ->
              result.cinema = cinema
              result
            )
            r.table('movies').filter({cinema: cinema.toString()}).delete().run(conn).then () ->
              r.table('movies').insert(schedule).run(conn)
              .then (result) ->
                finResult.push result
                r.table('updates').filter({cinema: cinema.toString()}).update({lastUpdate: newDate}).run(conn).then (result) ->
                  finResult.push result
          else
            return)
    .then () ->
      finResult
    .finally(next)
