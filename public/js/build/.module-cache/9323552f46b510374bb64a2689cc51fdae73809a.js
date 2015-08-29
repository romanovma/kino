/** @jsx React.DOM */
'use strict';

var React = require('react');
var ReactSwipe = require('react-swipe');
var $ = require('jquery');

var CINEMAS = 4;
var HOURSTART = 11;
var HOUREND = 24;
var HOURS = HOUREND - HOURSTART;
var FONTFACTOR = 0.66; //font-size divided by line-height
var WEEKDAY=new Array(7);
WEEKDAY[0]='Monday';
WEEKDAY[1]='Tuesday';
WEEKDAY[2]='Wednesday';
WEEKDAY[3]='Thursday';
WEEKDAY[4]='Friday';
WEEKDAY[5]='Saturday';
WEEKDAY[6]='Sunday';

var MovieBox = React.createClass({displayName: "MovieBox",
  getInitialState: function () {
    return {
      data:[]
    };
  },
  componentDidMount: function () {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    return (
      React.createElement("div", {className: "movieBox container"}, 
          React.createElement("div", null, 
            React.createElement(MovieList, {data: this.state.data})
          )
      )
    );
  }
});

var MovieList = React.createClass({displayName: "MovieList",
  render: function() {
    var movieCards = this.props.data.map(function (movie) {
      var imagePath = 'images/' + movie.imdbid + '.jpg';
      return (
        React.createElement(MovieCard, {name: movie.name, imagePath: imagePath, dates: movie.dates}
        )
      );
    });
    return (
      React.createElement("div", {className: "movieList row"}, 
        movieCards
      )
    );
  }
});

var MovieCard = React.createClass({displayName: "MovieCard",
  next: function () {
    console.log('swipe clicked');
    this.refs.ReactSwipe.swipe.next();
  },
  render: function() {
    var imgStyle = {
      margin: '0 0 10px 0'
    };
    var movieDays = [];
    //var today = +(new Date()).setHours(0,0,0,0);
    var today = 1437325200000;
    for (var day in this.props.dates) {
      if (day >= today) {
        movieDays.push(
          React.createElement("div", null, 
            React.createElement(MovieDay, {name: this.props.name, times: this.props.dates[day], day: day})
          )
        );
      }
    }
    return (
      React.createElement("div", {className: "col-xs-12 col-sm-6 panel"}, 
        React.createElement("h4", {className: "movieName"}, 
          this.props.name
        ), 
        React.createElement(ReactSwipe, {ref: "ReactSwipe"}, 
          React.createElement("div", null, 
            React.createElement("a", {href: "#", onClick: this.next}, " Schedule "), 
            React.createElement("img", {clasName: "movieImage img-rounded", src: this.props.imagePath, alt: this.props.name, width: "100%", style: imgStyle})
          ), 
          movieDays, 
          React.createElement("div", null, 
            "Trailer"
          )
        )
      )
    );
  }
});

var MovieDay = React.createClass({displayName: "MovieDay",
  drawSchedule: function (canvas, ctx) {
    var i = 0;
    var fontsize = 0;
    var width = canvas.width;
    var height = canvas.height;

    ctx.lineWidth = 0.1;
    ctx.beginPath();
    for (i = 1; i < CINEMAS; i++) {
      ctx.moveTo(width / CINEMAS * i + 0.5, 0);
      ctx.lineTo(width / CINEMAS * i + 0.5, height);
    }
    ctx.strokeStyle = '#111111';
    ctx.stroke();

    ctx.fillStyle = '#222222';
    fontsize = height / HOURS * FONTFACTOR;
    ctx.font='lighter ' + fontsize + 'px Times New Roman';
    this.props.times.forEach(function (dateString) {
      var date = new Date(dateString);
      var minutes = (date.getHours() - HOURSTART) * 60 + date.getMinutes();
      ctx.fillText(date.toTimeString().toString().slice(0,5), 10, height / HOURS + minutes / (HOURS * 60) * (height - height/HOURS));
    });
  },
  componentDidMount: function () {
    var canvas = document.getElementById(this.props.name + this.props.day);
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawSchedule(canvas, ctx);
  },
  todayString: function (day) {
    //var today = +(new Date()).setHours(0,0,0,0);
    var today = 1437325200000;
    if (day == today) {
      return 'Today';
    } else {
      var result = new Date(day);
      console.log(result.getDay());
      return WEEKDAY[result.getDay()];
    }
  },
  render: function () {
    return (
      React.createElement("div", null, 
        React.createElement("div", null, " ", this.todayString(this.props.day), " "), 
        React.createElement("canvas", {id: this.props.name + this.props.day, width: "300px", height: "400px"})
      )
    );
  }
});

console.log('react prerender');

React.render(
  React.createElement(MovieBox, {url: "movies.json"}),
  document.getElementById('content')
);

console.log('react afterrender');