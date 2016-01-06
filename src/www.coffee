#!/usr/bin/env node

###
 Module dependencies.
###

app = require './server'
config = require './config'
#async = require 'async'
CronJob = require('cron').CronJob
dataManager = require './dataManager'
debug = require('debug')('server')
http = require 'http'
nodemailer = require 'nodemailer'
r = require 'rethinkdb'

###
 Helpers
###

normalizePort = (val) ->
  port = parseInt val, 10
  if isNaN(port)
    # named pipe
    return val
  if port >= 0
    # port number
    return port
  false


onError = (error) ->
  if error.syscall isnt 'listen'
    throw error

  bind = if typeof port == 'string' then 'Pipe ' + port else 'Port ' + port

  # handle specific listen errors with friendly messages
  switch error.code
    when 'EACCES'
      console.error bind + ' requires elevated privileges'
      process.exit 1
    when 'EADDRINUSE'
      console.error bind + ' is already in use'
      process.exit 1
    else
      throw error


onListening = () ->
  addr = server.address()
  bind = if typeof addr == 'string' then 'pipe ' + addr else 'port ' + addr.port
  debug 'Listening on ' + bind


###
 Get port from environment and store in Express.
###

port = normalizePort(process.env.PORT or config.port or 8888)
app.set 'port', port


###
 Create HTTP server.
###

server = http.createServer app


###
 Listen on provided port, on all network interfaces.
###

server.listen port, () ->
    console.log 'Listening on http://localhost:' + port

server.on 'error', onError
server.on 'listening', onListening


###
 Cron Job which gets new schedule every night.
###

###
new CronJob({
  cronTime: '*  0-23  * *',
  onTick: function() {
    debug('cron started')
    async.series([
      async.apply(dataManager.getRawScheduleAll, 'ALL'),
      dataManager.clearMovieFile,
      async.apply(dataManager.updateScheduleAll, 'ALL')
    ], function (err) {
      if (!err) err = 'Schedule updated'
      debug(err)
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'kinoInCM@gmail.com',
          pass: '***'
        }
      })

      mailOptions = {
        from: 'kinoInCM@gmail.com',
        to: 'romanovma.pookl@gmail.com',
        subject: 'kino: schedule update',
        text: err
      }

      transporter.sendMail(mailOptions, function(error, response){
        if(error)
        {
          debug('error:' + error)
        } else
        {
          debug('message:' + response.message)
        }
        transporter.close()
      })
    })
  },
  start: true,
  timeZone: 'Asia/Bangkok'
})
###
