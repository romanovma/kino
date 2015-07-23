var data = [
  {name: "TED 2", text: "This is one movie"},
  {name: "Terminator", text: "This is *another* movie"}
];

var MovieBox = React.createClass({displayName: "MovieBox",
  getInitialState: function() {
    return {data: []};
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
        React.createElement(MovieCard, {name: movie.name}, 
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
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return (
      React.createElement("div", {class: "movieCard"}, 
        "I am MovieCard.", 
        React.createElement("h2", {className: "movieName"}, 
          this.props.name
        ), 
        React.createElement("span", {dangerouslySetInnerHTML: {__html: rawMarkup}})
      )
    )
  }
});

React.render(
  React.createElement(MovieBox, {url: "movies.json"}),
  document.getElementById('content')
);
