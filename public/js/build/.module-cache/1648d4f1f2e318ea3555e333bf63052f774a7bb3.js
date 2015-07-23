var MovieBox = React.createClass({displayName: "MovieBox",
  render: function() {
    return (
      React.createElement("div", {className: "movieBox"}, 
        "Hello, world! I am MovieBox."
      )
    );
  }
});

React.render(
  React.createElement(MovieBox, null),
  document.getElementById('content')
);
