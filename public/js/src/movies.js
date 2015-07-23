/** @jsx React.DOM */

var MovieBox = React.createClass({
  getInitialState: function() {
    return {data:[]};
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
      <div className = "movieBox container">
        <MovieList data={this.state.data}/>
      </div>
    );
  }
});

var MovieList = React.createClass({
  render: function() {
    var movieNodes = this.props.data.map(function(movie) {
      var imagePath = "images/" + movie.imdbid + ".jpg";
      return (
        <MovieCard name={movie.name} imagePath={imagePath} dates={movie.dates}>
        </MovieCard>
      );
    });
    return (
      <div className = "movieList row">
        {movieNodes}
      </div>
    );
  }
});

var MovieCard = React.createClass({
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
      default:
        this.setState({cardType: "image"});
    };
    return;
  },
  render: function() {
    switch (this.state.cardType) {
      case "info":
      case "schedule":
        var dates = this.props.dates.map(function(date) {
          return (
            <li> {date} </li>
          );
        });
        return (
          <div className = "movieCard col-xs-12 col-sm-6 panel" onTouchStart = {this.handleTouch}>
            <ul>
              {dates}
            </ul>
          </div>
        );
        break;
      case "image":
      default:
        return (
          <div className = "movieCard col-xs-12 col-sm-6 panel" onTouchStart = {this.handleTouch}>
            <h4 className="movieName">
              {this.props.name}
            </h4>
            <img clasName="movieImage img-rounded" src={this.props.imagePath} alt={this.props.name} width="100%"/>
          </div>
        );
    }
  }
});

console.log('react prerender');

React.render(
  <MovieBox url="movies.json" />,
  document.getElementById('content')
);

console.log('react afterrender');
