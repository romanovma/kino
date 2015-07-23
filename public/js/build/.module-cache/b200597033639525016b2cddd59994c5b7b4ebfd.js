var MovieBox = React.createClass({displayName: "MovieBox",
  render: function() {
    return (
      React.createElement("div", {className: "movieBox"}, 
        React.createElement(MovieList, null)
      )
    );
  }
});

var MovieList = React.createClass({displayName: "MovieList",
  render: function() {
    return (
      React.createElement("div", {class: "movieList"}, 
        "I am MovieList.", 
        React.createElement(MovieCard, {name: "Pete Hunt"}, "This is one movie"), 
        React.createElement(MovieCard, {name: "Jordan Walke"}, "This is *another* movie")
      )
    )
  }
});

var MovieCard = React.createClass({displayName: "MovieCard",
  render: function() {
    return (
      React.createElement("div", {class: "movieCard"}, 
        "I am MovieCard.", 
        React.createElement("h2", {className: "movieName"}, 
          this.props.name
        ), 
        marked(this.props.children.toString())
      )
    )
  }
});

React.render(
  React.createElement(MovieBox, null),
  document.getElementById('content')
);
