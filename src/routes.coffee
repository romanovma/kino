express = require 'express'
bodyParser = require 'body-parser'
debug = require('debug')('router')
#index = require './app/bundle'
React = require 'react'
dbUtils = require './dbUtils'
require 'coffee-react/register'
App = React.createFactory(require './app/components/App.cjsx')


router = express.Router()

router.use bodyParser.urlencoded({ extended: true })

router.get '/', (req, res, next) ->
  dbUtils.getMovies req._rdbConn
  .then (result) ->
    rendered = React.renderToString App
      movies: result
    res.render 'layout',
      content: rendered
      state: JSON.stringify(result)
  .error (e) ->
    console.log e.message
  #.finally next

router.get '/update', (req, res, next) ->
  dbUtils.updateSchedule req._rdbConn
  .then (result) ->
    res.send JSON.stringify(result)
  .error (err) ->
    next(err)

router.param '/:id', (req, res, next) ->
  console.log 'page was not found'
  res.status 404
  err = new Error 'Not Found'
  err.status = 404;
  res.format
    html: () ->
      next(err)

module.exports = router;
