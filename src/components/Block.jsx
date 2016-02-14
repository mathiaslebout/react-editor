const React = require('react')
const ReactDOM = require('react-dom')
const Word = require('./Word')
const Glyph = require('./Glyph')
const Cursor = require('./Cursor')

class Block extends React.Component {
  static defaultProps = {
    nbsp: '&#160;'.replace(/&#(\d+);/g, function(match, dec) {
      return String.fromCharCode(dec);
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      glyphs: props.glyphs,
      cursorPos: 0,
      editing: props.editing,
      blockOffsetTop: 0,
      newlinePosition: []
    }
  }

  componentDidMount() {
    const dom = ReactDOM.findDOMNode(this)
    const offsetLeft = $(dom).offset().left
    const width = $(dom).width()
    this.setState({
      borderLeft: width + offsetLeft
    })
  }

  componentWillReceiveProps(nextProps) {
    // const dom = ReactDOM.findDOMNode(this)
    // const offsetLeft = $(dom).offset().left
    // const width = $(dom).width()
    this.setState({
      editing: nextProps.editing,
      // borderLeft: width + offsetLeft
    })
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   if (nextState.blockOffsetTop != this.state.blockOffsetTop) return false
  //
  //   return true
  // }

  render() {
    console.log('Rendering Block (cursor position: ' + this.state.cursorPos + ', type: ' + this.props.type + ' )')
    return <this.props.type
        style={{marginLeft: '50px'}}
        onMouseUp={this.handleMouseUp}>
        {this.renderWords()}
      </this.props.type>
//         style={{marginLeft: '20px', display: 'flex', flexWrap: 'wrap'}}
  }

  renderWords() {
    const words = this.state.glyphs.join('').split(this.props.nbsp)
    let startPosition = 0
    let _words = []
    let line = 0
    for (let i = 0; i < words.length; i ++) {
      const word = words[i]
      let glyphs = word.split('')
      if (i === words.length - 1) {
        glyphs.push(' ')
      }

      if (this.state.newlinePosition.indexOf('word' + i) != -1) {
        _words.push(<br/>)
        line ++
      }

      let _word = <Word
          nbsp={this.props.nbsp}
          setCursorPosition={this.setCursorPosition}
          startPosition={startPosition}
          key={i}
          glyphs={glyphs}
          editing={this.state.editing}
          cursorPos={this.state.editing ? this.state.cursorPos : -1}
          blockBorderLeft={this.state.borderLeft}
          line={line}
          setCurrentWord={this.setCurrentWord.bind(this)}
          ref={'word' + i}>
        </Word>

      startPosition += word.length + 1

      _words.push(_word)
    }

    return _words;
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true
  }

  // renderGlyphs() {
  //   return this.state.glyphs.map(function (glyph, i) {
  //     return <Glyph
  //       setCursorPosition={this.setCursorPosition}
  //       value={glyph}
  //       position={i}
  //       key={i}
  //       cursorPos={this.state.editing ? this.state.cursorPos : -1}
  //       ref={'item' + i}/>
  //   }.bind(this))
  // }

  componentDidUpdate(prevProps, prevState) {
    // console.log('Block offset top: ' + blockOffsetTop)
    const k = Object.keys(this.refs).find((key) => {
      const glyphDom = ReactDOM.findDOMNode(this.refs[key])
      const glyphOffsetLeft = $(glyphDom).offset().left
      const glyphWidth = $(glyphDom).width()

      // pos += this.refs[key].props.glyphs.length

      if ((glyphWidth + glyphOffsetLeft) >= this.state.borderLeft) {
        console.log('Should display ' + key + ' on new line')
        return true

      } else {
        return false
      }
    })

    if (k) {
      this.setState({
        newlinePosition: this.state.newlinePosition
          .concat([k])
      })
    }
  }

  addGlyph = (event) => {
    const code = event.keyCode
    let glyph = null
    // console.log('New glyph code: ' + code)
    switch (code) {
      // enter
      case 13:
        const glyphs = this.state.glyphs.slice(this.state.cursorPos)

        // should create another block
        this.setState({
          editing: false,
          glyphs: this.state.glyphs.slice(0, this.state.cursorPos)
            .concat([''])
        })
        return this.props.insertBlock(this, glyphs)
        break

      // space
      case 32:
        glyph = this.props.nbsp
        break

      default:
        glyph = String.fromCharCode(event.keyCode)
    }

    this.setState({
      glyphs: this.state.glyphs.slice(0, this.state.cursorPos)
        .concat([glyph])
        .concat(this.state.glyphs.slice(this.state.cursorPos, -1))
        .concat(['']),
      cursorPos: this.state.cursorPos + 1,
      newlinePosition: []
    })
  }

  appendGlyphs(glyphs) {
    this.setState({
      glyphs: this.state.glyphs.slice(0, -1)
        .concat(glyphs)
    })
  }

  removeNextGlyph() {
    if (this.state.cursorPos === this.state.glyphs.length - 1)
      return this.props.mergeWithNextBlock(this)

    this.setState({
      glyphs: this.state.glyphs.slice(0, this.state.cursorPos)
        .concat(this.state.glyphs.slice(this.state.cursorPos + 1, -1))
        .concat(['']),
      newlinePosition: []
    })
  }

  removePreviousGlyph() {
    if (this.state.cursorPos <= 0)
      return this.props.mergeWithPreviousBlock(this)

    const glyph = this.state.glyphs[this.state.cursorPos]
    const l = glyph === '\r' ? 2 : 1

    this.setState({
      glyphs: this.state.glyphs.slice(0, this.state.cursorPos - 1)
        .concat(this.state.glyphs.slice(this.state.cursorPos, -1))
        .concat(['']),
      cursorPos: this.state.cursorPos - 1,
      newlinePosition: []
    })
  }

  moveCursor = (direction) => {
    const currentWord = this.state.currentWord
    const currentLinePos = currentWord.props.line
    switch (direction) {
    case 'left':
      if (this.state.cursorPos === 0)
        return this.props.moveToPreviousBlock()

      this.setState({
        cursorPos: this.state.cursorPos - 1
      })
      break

    case 'right':
      if (this.state.cursorPos === this.state.glyphs.length -1)
        return this.props.moveToNextBlock()

      this.setState({
        cursorPos: this.state.cursorPos + 1
      })
      break

    case 'up':
      if (currentLinePos > 0) {
        var breakingWord = this.refs[this.state.newlinePosition[currentLinePos - 1]]
        let cursorPos = this.state.cursorPos - breakingWord.props.startPosition
        if (cursorPos < 0) {
          cursorPos = 0
        }

        this.setState({
          cursorPos: cursorPos
        })

        return false

      } else return true
      break

    case 'down':
      if (currentLinePos < this.state.newlinePosition.length) {
        var breakingWord = this.refs[this.state.newlinePosition[currentLinePos]]
        let cursorPos = this.state.cursorPos + breakingWord.props.startPosition
        if (cursorPos >= this.state.glyphs.length) {
          cursorPos = this.state.glyphs.length - 1
        }

        this.setState({
          cursorPos: cursorPos
        })

        return false

      } else return true
      break

    case 'home':
      this.setState({
        cursorPos: 0
      })
      break

    case 'end':
      this.setState({
        cursorPos: this.state.glyphs.length - 1
      })
      break

    default:

    }
  }

  setCursorPosition = (position, direction) => {
    var selection = getSelection()
    if (selection.rangeCount === 0) return
    var range = selection.getRangeAt(0)

    if (direction) {
      switch (direction) {
        case 'up':
          // must set position on last line
          if (this.state.newlinePosition.length > 0) {
            const startLine = this.refs[this.state.newlinePosition[this.state.newlinePosition.length - 1]].props.startPosition
            position = startLine + position - 1
          }
          break

        case 'down':
          // must set position on first line
          if (this.state.newlinePosition.length > 0) {
            const lineLength = this.refs[this.state.newlinePosition[0]].props.startPosition
            if (position > lineLength) {
              position = position % lineLength
            }
          }
          break
      }
    }

    if (position >= this.state.glyphs.length)
      position = this.state.glyphs.length - 1

    this.setState({
      cursorPos: range.collapsed ? position : -1
    })
  }

  setCurrentWord = (word) => {
    if (this.state.currentWord != word) {
      this.setState({
        currentWord: word
      })
    }
  }

  handleMouseUp = (e) => {
    // console.log('handleMouseUp on Block')
    this.props.setCurrentBlock(this)
  }

}

module.exports = Block
