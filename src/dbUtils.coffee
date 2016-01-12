r = require 'rethinkdb'
config = require './config'
http = require 'http'
reqPro = require 'request-promise'
async = require 'async'
promise = require 'bluebird'


#TODO: pass error down to middlewares

module.exports =
  createConnection: (req, res, next) ->
    console.log 'creating connection to: ' + config.rethinkdb
    r.connect config.rethinkdb
    .then (connection) ->
      req._rdbConn = connection
      console.log 'connection created'
      next()
    .error (error) ->
      console.log error
      next()

  closeConnection: (req, res, next) ->
    console.log 'closing rdb connection'
    req._rdbConn.close()
    console.log 'connection closed'
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
        r.table('updates').filter({cinema: cinema}).run(conn)
        .then (cursor) ->
          cursor.toArray().then (array) ->
            oldDate = array[0]?.lastUpdate
            newDate = showtimes.results.reduce((max, current) ->
              return if max.updated_on < current.updated_on then current else max)
              .updated_on
            if not(oldDate?) or (oldDate isnt newDate)
              schedule = showtimes.results.filter((result) ->
                result.audio.indexOf('en') > -1 or result.caption.indexOf('en') > -1
              ).map((result) ->
                result.cinema = cinema.toString()
                result
              )
              r.table('movies').filter({cinema: cinema}).delete().run(conn).then (result) ->
                finResult.push result
                r.table('movies').insert(schedule).run(conn)
                .then (result) ->
                  finResult.push result
                  r.table('updates').filter({cinema: cinema}).update({lastUpdate: newDate}).run(conn).then (result) ->
                    finResult.push result
            else
              return)
    .then () ->
      finResult
    .finally(next)
