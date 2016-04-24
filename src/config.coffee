module.exports =
  port: 8888

  rethinkdb:
    host: 'localhost'
    port: 28015
    authKey: ''
    db: 'kino_cm'

  cinemas:
    maya: '4'
    promenada: '29'
    festival: '83'
    airport: '82'

  cinemaUrls:
    maya: 'http://booking.sfcinemacity.com/visPrintShowTimes.aspx?visLang=1&visCinemaId=9936'
    promenada: 'http://booking.sfcinemacity.com/visPrintShowTimes.aspx?visCinemaID=9934&visLang=1'
    festival: 'http://www.majorcineplex.com/booking2/search_showtime/cinema=91'
    airport: 'http://www.majorcineplex.com/booking2/search_showtime/cinema=40'

  api:
    theater: 'http://showtimes.everyday.in.th/api/v2/theater/'
    movie: 'http://showtimes.everyday.in.th/api/v2/movie/'
