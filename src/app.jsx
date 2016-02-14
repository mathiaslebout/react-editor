const React = require('react')
const ReactDOM = require('react-dom')
const Routes = require('./Routes')
const Main = require('./components/Main')

var getNextNode = function(node, skipChildren, endNode){
  if (endNode == node) {
    return null;
  }
  if (node.firstChild && !skipChildren) {
    return node.firstChild;
  }
  if (!node.parentNode){
    return null;
  }
  return node.nextSibling
         || getNextNode(node.parentNode, true, endNode);
}


var element = React.createElement(Main);
ReactDOM.render(Routes, document.querySelector('.container-fluid'));
