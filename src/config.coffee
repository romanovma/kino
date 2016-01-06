module.exports =
  port: 8888

  rethinkdb:
    host: 'localhost'
    port: 28015
    authKey: ''
    db: 'kino_cm'

  cinemas:
    maya: 4
    promenada: 29
    festival: 83
    airport: 82

  api:
    theater: 'http://showtimes.everyday.in.th/api/v2/theater/'
