React = require 'react'
App = require './components/App.cjsx'

initialState = JSON.parse document.getElementById('initial-state').innerHTML

React.render <App movies={initialState} />, document.getElementById('content')
