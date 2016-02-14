const React = require('react')
const ReactDOM = require('react-dom')
const Cursor = require('./Cursor')

class Glyph extends React.Component {
  static defaultProps = {
    position: null,
    cursorPos: null,
  }

  state = {
    selected: false,
  }

  render() {
    // console.log('Rendering Glyph (position: ' + this.props.position + ')')
    return <span
      style={{position: 'relative'}}
      ref={(c) => this._glyph = c}
      onMouseUp={this.handleMouseUp}>
      {this.props.cursorPos === this.props.position ? <Cursor /> : null}
      {this.props.value}
    </span>
  }

  componentDidMount() {
    // this.props.dom = ReactDOM.findDOMNode(this)
  }

  componentDidUpdate(prevProps, prevState) {
    // const domNode = ReactDOM.findDOMNode(this)
    // this.setState({
    //    offsetTop: $(domNode).offset().top
    // })
    // console.log(this.props)
    if (this.props.cursorPos === this.props.position) {
      this.props.setCurrentWord(this)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true
  }

  isNode(node) {
    return node === this._glyph
  }

  setSelected(selected) {
    console.log('selected')
    this.setState({
      selected: selected
    })
  }

  handleMouseUp = (e) => {
    console.log('Set cursor position')
    console.log(this.props.position)
    this.props.setCursorPosition(this.props.position)
  }
}

module.exports = Glyph
