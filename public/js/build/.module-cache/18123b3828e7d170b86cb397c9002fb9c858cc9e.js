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
      var schedule = JSON.stringify(movie.schedule)
      return (
        React.createElement(MovieCard, {name: movie.name, imagePath: imagePath, schedule: schedule}
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
  getInitialState: function() {
    return {cardType: "image"};
  },
  handleTouch: function(e) {
    //e.preventDefault();
    switch (this.state.cardType) {
      case "image":
        this.setState({cardType: "schedule"});
        break;
      case "schedule":
        this.setState({cardType: "info"});
        break;
      case "info":
        break;
      default:
        this.setState({cardType: "image"});
    }
    this.setState({cardType: "schedule"});
  },
  render: function() {
    switch (this.state.cardType) {
      case "image":
        return (
          React.createElement("div", {className: "movieCard col-xs-12 col-sm-6 panel", onTouchStart: this.handleTouch}, 
            React.createElement("h4", {className: "movieName"}, 
              this.props.name
            ), 
            React.createElement("img", {clasName: "movieImage img-rounded", src: this.props.imagePath, alt: this.props.name, width: "100%"})
          )
        );
        break;
      case "schedule":
        return (
          React.createElement("div", {className: "movieCard col-xs-12 col-sm-6 panel", onTouchStart: this.handleTouch}, 
            React.createElement("p", null, this.props.schedule)
          )
        );
        break;
      default:
    }
  }
});

console.log('react prerender');

React.render(
  React.createElement(MovieBox, {url: "movies.json"}),
  document.getElementById('content')
);

console.log('react afterrender');
