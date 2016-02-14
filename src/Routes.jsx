const React = require('react')
const ReactRouter = require('react-router')
const Router = ReactRouter.Router
const Route = ReactRouter.Route
const Main = require('./components/Main')
const Block = require('./components/Block')

module.exports = (
  <Router>
    <Route path="/" component={Main}>
    </Route>
  </Router>
)
