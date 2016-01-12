bodyParser = require 'body-parser'
cookieParser = require 'cookie-parser'
express = require 'express'
# favicon = require('serve-favicon')
logger = require 'morgan'
routes = require './routes'
path = require 'path'
dbUtils = require './dbUtils'


app = express()

# view engine setup
app.set 'views', path.join(__dirname, 'views')
app.set 'view engine', 'jade'

# uncomment after placing your favicon in /public
# app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use logger('dev')
app.use bodyParser.json()
app.use bodyParser.urlencoded({ extended: false })
app.use cookieParser()
app.use(express.static(path.join(__dirname, '../public')))
#app.use '/js', express.static(path.join(__dirname, (process.env.JS_FOLDER || 'app')))
#app.use '/css', express.static(path.join(__dirname, (process.env.CSS_FOLDER || 'css')))

app.use dbUtils.createConnection

app.use '/', routes

app.use dbUtils.closeConnection

app.use (err, req, res, next) ->
  console.error err.stack
  next err
  return

# catch 404 and forward to error handler
app.use (req, res, next) ->
  err = new Error('Not Found')
  err.status = 404
  next err
  return

# error handlers

# development error handler
# will print stacktrace
if app.get('env') is 'development'
  app.use (err, req, res, next) ->
    res.status(err.status or 500)
    res.render 'error',
      message: err.message
      error: err
    return

# production error handler
# no stacktraces leaked to user
app.use (err, req, res, next) ->
  res.status(err.status or 500)
  res.render 'error',
    message: err.message,
    error: {}
  return


module.exports = app
