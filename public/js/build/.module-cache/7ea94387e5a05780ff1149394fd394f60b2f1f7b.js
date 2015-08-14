var React = require('react');
var ReactSwipe = require('react-swipe');

/** @jsx React.DOM */

var MovieBox = React.createClass({displayName: "MovieBox",
  getInitialState: function() {
    return {
      data:[]
    };
  },
  componentDidMount: function() {
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
      var imagePath = "images/" + movie.imdbid + ".jpg";
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
  render: function() {
    var dates = this.props.dates.map(function(date) {
      return (
        React.createElement("li", null, " ", date, " ")
      );
    });
    return (
      React.createElement(ReactSwipe, null, 
        React.createElement("div", {className: "col-xs-12 col-sm-6 panel"}, 
          React.createElement("h4", {className: "movieName"}, 
            this.props.name
          ), 
          React.createElement("img", {clasName: "movieImage img-rounded", src: this.props.imagePath, alt: this.props.name, width: "100%"})
        ), 
        React.createElement("div", {className: "col-xs-12 col-sm-6 panel"}, 
          React.createElement("ul", null, 
            dates
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
