var data = [
  {name: "TED 2", text: "This is one comment"},
  {name: "Terminator", text: "This is *another* comment"}
];

var MovieBox = React.createClass({displayName: "MovieBox",
  render: function() {
    return (
      React.createElement("div", {className: "movieBox"}, 
        React.createElement(MovieList, {data: this.props.data})
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
  React.createElement(MovieBox, {data: data}),
  document.getElementById('content')
);
