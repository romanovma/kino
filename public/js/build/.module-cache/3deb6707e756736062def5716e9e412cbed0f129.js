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
    var movieNodes = this.props.data.map(function(movie) {
      var imagePath = 'images/' + movie.imdbid + '.jpg';
      return (
        React.createElement(MovieCard, {name: movie.name, imagePath: imagePath, dates: movie.dates}
        )
      );
    });
    return (
      React.createElement("div", {className: "movieList row"}, 
        movieNodes
      )
    );
  }
});

var MovieCard = React.createClass({displayName: "MovieCard",
  next: function () {
    console.log('swipe clicked');
    this.refs.ReactSwipe.swipe.next();
  },
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
    var cinema = this.props.name;
    this.props.dates.forEach( function (dateString) {
      var date = new Date(dateString);
      console.log(cinema + date);
      var minutes = (date.getHours() - HOURSTART) * 60 + date.getMinutes();
      ctx.fillText(date.toTimeString().slice(0,5), 10, height / HOURS + minutes / (HOURS * 60) * (height - height/HOURS));
    });
  },
  componentDidMount: function () {
    var canvas = document.getElementById(this.props.name);
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawSchedule(canvas, ctx);
  },
  render: function() {
    var style = {
      backgroundColor: '#EEEEEE'
    };
    return (
      React.createElement("div", {className: "col-xs-12 col-sm-6 panel", style: style}, 
        React.createElement("h4", {className: "movieName"}, 
          this.props.name
        ), 
        React.createElement(ReactSwipe, {ref: "ReactSwipe"}, 
          React.createElement("div", null, 
            React.createElement("a", {href: "#", onClick: this.next}, " Schedule "), 
            React.createElement("img", {clasName: "movieImage img-rounded", src: this.props.imagePath, alt: this.props.name, width: "100%"})
          ), 
          React.createElement("div", null, 
            React.createElement("canvas", {id: this.props.name, width: "300px", height: "400px"})
          ), 
          React.createElement("div", null, 
            "Trailer"
          )
        )
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
