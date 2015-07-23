/** @jsx React.DOM */

var MovieBox = React.createClass({displayName: "MovieBox",
  getInitialState: function() {
    return {data: []};
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
      React.createElement("div", {className: "movieBox"}, 
        React.createElement(MovieList, {data: this.state.data})
      )
    );
  }
});

var MovieList = React.createClass({displayName: "MovieList",
  render: function() {
    var movieNodes = this.props.data.map(function(movie) {
      return (
        React.createElement(MovieCard, {name: movie.name, image: movie.image}, 
          movie.text
        )
      );
    });
    return (
      React.createElement("div", {className: "movieList"}, 
        movieNodes
      )
    );
  }
});

var MovieCard = React.createClass({displayName: "MovieCard",
  render: function() {

    return (
      React.createElement("div", {class: "movieCard"}, 
        "I am MovieCard.", 
        React.createElement("h4", {className: "movieName"}, 
          this.props.name
        ), 
        React.createElement("img", {clasName: "movieImage", src: "images/tt51707.jpg", alt: this.props.name, width: "288"})
      )
    )
  }
});

console.log('react prerender');

React.render(
  React.createElement(MovieBox, {url: "movies.json"}),
  document.getElementById('content')
);

console.log('react afterrender');
