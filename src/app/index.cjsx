React = require 'react'
Welcome = require './components/Welcome.cjsx'

initialState = JSON.parse document.getElementById('initial-state').innerHTML

React.render <Welcome movies={initialState} />, document.getElementById('content')
