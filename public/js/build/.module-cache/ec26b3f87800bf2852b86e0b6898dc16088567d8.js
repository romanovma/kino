var MovieBox = React.createClass({displayName: "MovieBox",
  render: function() {
    return (
      React.createElement("div", {className: "movieBox"}, 
        React.createElement("h1", null, " ololo "), 
        React.createElement(MovieList, null), 
        React.createElement("movieCard", null)
      )
    );
  }
});

var MovieList = React.createClass({displayName: "MovieList",
  render: function() {
    return (
      React.createElement("div", {class: "movieList"}, 
        "I am MovieList."
      )
    )
  }
});

var MovieCard = React.createClass({displayName: "MovieCard",
  render: function() {
    return (
      React.createElement("div", {class: "movieCard"}, 
        "I am MovieCard."
      )
    )
  }
});

React.render(
  React.createElement(MovieBox, null),
  document.getElementById('content')
);
