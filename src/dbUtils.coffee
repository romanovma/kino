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
        schedule = showtimes.results.filter((result) ->
          result.audio.indexOf('en') > -1 or result.caption.indexOf('en') > -1
        ).map((result) ->
          result.cinema = cinema
        )
        r.table 'movies'
        .insert schedule
        .run conn
        .then (result) ->
          finResult.push result)
    .then () ->
      finResult
    .finally(next)
