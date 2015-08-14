/** @jsx React.DOM */
'use strict';

var React = require('react');
var ReactSwipe = require('react-swipe');
var $ = require('jquery');

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
        React.createElement(MovieList, {data: this.state.data})
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
    this.refs.ReactSwipe.swipe.next();
  },
  drawSchedule: function (canvas, ctx) {
    var width = canvas.width;
    var height = canvas.height;
    ctx.lineWidth = 1;
    for (var i = 1; i < 4; i++) {
      ctx.moveTo(width / 4 * i, 0);
      ctx.lineTo(width / 4 * i, height);
    }
    ctx.stroke();
  },
  componentDidMount: function () {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawSchedule(canvas, ctx);
  },
  render: function() {
    var dates = this.props.dates.map(function(date) {
      return (
        React.createElement("li", null, " ", date, " ")
      );
    });
    return (
      React.createElement(ReactSwipe, {className: "col-xs-12 col-sm-6 panel", ref: "ReactSwipe"}, 
        React.createElement("div", null, 
          React.createElement("h4", {className: "movieName"}, 
            this.props.name
          ), 
          React.createElement("img", {clasName: "movieImage img-rounded", src: this.props.imagePath, alt: this.props.name, width: "100%"}), 
          React.createElement("a", {href: "#", onClick: this.next}, " Schedule ")
        ), 
        React.createElement("div", null, 
          React.createElement("canvas", {id: "canvas", width: "100%"}), 
          React.createElement("ul", null, 
            dates
          )
        ), 
        React.createElement("div", null, 
          "Trailer"
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
