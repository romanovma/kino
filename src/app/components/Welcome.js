var React, Welcome;

React = require('react');

module.exports = Welcome = React.createClass({
  render: function() {
    return React.createElement("div", null, "\'hello world\'");
  }
});
