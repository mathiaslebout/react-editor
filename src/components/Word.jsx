const React = require('react')
const ReactDOM = require('react-dom')
const Glyph = require('./Glyph')
const Block = require('./Block')

class Word extends React.Component {
  // static defaultProps = {
  //   glyphs: [],
  // }

  constructor(props) {
    super(props)
    this.borderLeft = 0
    this.state = {
      glyphs: this.props.glyphs.concat(this.props.nbsp)
    }
  }

  render() {
    console.log('Rendering word with glyphs: ' + this.state.glyphs.toString() + ' on line ' + this.props.line)
    return <span>
      {this.renderGlyphs()}
    </span>
  }

  renderGlyphs() {
    return this.state.glyphs.map((glyph, i) => {
      if (glyph === '\r') {
        return <br/>
      } else {
        return <Glyph
          setCursorPosition={this.props.setCursorPosition}
          value={glyph}
          position={this.props.startPosition + i}
          key={i}
          cursorPos={this.props.editing ? this.props.cursorPos : -1}
          setCurrentWord={this.setCurrentWord.bind(this)}
          ref={'item' + i}/>
      }
    })
  }

  shouldComponentUpdate(nextProps, nextState) {
    const glyphsTest = this.props.glyphs.join('') != nextProps.glyphs.join('')
    const prevCursorTest = (this.props.startPosition <= this.props.cursorPos)
      && (this.props.cursorPos <= this.props.startPosition + this.props.glyphs.length)
    const cursorTest = (this.props.cursorPos != nextProps.cursorPos)
      && (nextProps.startPosition <= nextProps.cursorPos)
      && (nextProps.cursorPos <= nextProps.startPosition + nextProps.glyphs.length)
    return glyphsTest || prevCursorTest || cursorTest
  }

  componentWillReceiveProps(nextProps) {
    const dom = ReactDOM.findDOMNode(this)
    const offsetLeft = $(dom).offset().left
    const width = $(dom).width()
    this.setState({
      glyphs: nextProps.glyphs.concat(this.props.nbsp),
      borderLeft: offsetLeft + width
    })
  }

  componentDidUpdate() {
    const dom = ReactDOM.findDOMNode(this)
    const offsetLeft = $(dom).offset().left
    const width = $(dom).width()
    this.borderLeft = width + offsetLeft
  }

  setCurrentWord(glyph) {
    this.props.setCurrentWord(this)
  }
}

module.exports = Word
