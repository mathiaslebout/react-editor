const React = require('react')
const ReactDOM = require('react-dom')
const Navbar = require('./Navbar')
const Block = require('./Block')
const Glyph = require('./Glyph')

class Main extends React.Component {
  static defaultProps = {
    nbsp: '&#160;'.replace(/&#(\d+);/g, function(match, dec) {
      return String.fromCharCode(dec);
    })
  }

  _getGlyphs = (glyphs) => {
    const words = glyphs.split(' ')
    const nbsp = this.props.nbsp
    let result = []
    words.forEach(function (word) {
      result = result.concat(word.split('')).concat([nbsp])
    })
    return result
  }

  state = {
    blocks: [
      {type: 'h1', glyphs: this._getGlyphs('This is a test. This is another test.')},
      {type: 'h1', glyphs: this._getGlyphs('This is another heading1. This is still another one.')}
    ],
    // blocks: [{type: 'h1', glyphs: ['']}],
    currentBlock: 0
  }

  render() {
    console.log('Rendering Main (current block: ' + this.state.currentBlock + ')')
    return <div>
      {this.renderNavbar()}
      {this.renderBlocks()}
    </div>
  }

  renderNavbar() {
    return <Navbar
        onChangeHeader={this.onChangeHeader.bind(this)}
      />
  }

  renderBlocks() {
    return this.state.blocks.map(function(block, index) {
      return <Block
        key={index}
        type={block.type}
        insertBlock={this.insertBlock.bind(this)}
        setCurrentBlock={this.setCurrentBlock.bind(this)}
        moveToNextBlock={this.moveToNextBlock.bind(this)}
        moveToPreviousBlock={this.moveToPreviousBlock.bind(this)}
        mergeWithPreviousBlock={this.mergeWithPreviousBlock.bind(this)}
        mergeWithNextBlock={this.mergeWithNextBlock.bind(this)}
        editing={this.state.currentBlock === index ? true : false}
        glyphs={block.glyphs}
        ref={'item' + index}>
      </Block>
    }.bind(this))
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps.params)
  }

  onChangeHeader = (h) => {
    this.state.blocks[this.state.currentBlock].type = h
    this.setState({
      currentBlock: this.state.currentBlock
    })
  }

  // insert a block after the given one with glyphs
  insertBlock(block, glyphs) {
    let currentBlock = 0
    Object.keys(this.refs).forEach((ref, index) => {
      if (this.refs[ref] === block) {
        currentBlock = index
      }
    })

    this.setState({
      blocks: this.state.blocks.slice(0, currentBlock + 1)
        .concat([{type: this.refs['item' + currentBlock].props.type, glyphs: glyphs}])
        .concat(this.state.blocks.slice(currentBlock + 1)),
      currentBlock: currentBlock + 1
    })
  }

  addBlock(glyphs) {
    this.setState({
      blocks: this.state.blocks.concat([{type: 'p', glyphs: ['']}]),
      currentBlock: this.state.currentBlock + 1
    })
  }

  setCurrentBlock = (blockRef) => {
    let currentBlock = 0
    Object.keys(this.refs).forEach((ref, index) => {
      if (this.refs[ref] === blockRef) {
        currentBlock = index
      }
    })

    this.setState({
      currentBlock: currentBlock
    })
  }

  moveToNextBlock() {
    if (this.state.currentBlock === this.state.blocks.length - 1) return
    this.setState({
      currentBlock: this.state.currentBlock + 1
    })
  }

  moveToPreviousBlock() {
    if (this.state.currentBlock === 0) return
    const prev = this.refs['item' + (this.state.currentBlock - 1)]
    prev.setCursorPosition(prev.state.glyphs.length - 1)
    this.setState({
      currentBlock: this.state.currentBlock - 1
    })
  }

  // merge content
  mergeWithPreviousBlock(block) {
    let previousBlock
    Object.keys(this.refs).forEach((ref, index) => {
      if (this.refs[ref] === block) {
        previousBlock = index - 1
      }
    })

    if (previousBlock < 0) return

    const prev = this.refs['item' + previousBlock]
    // merge glyphs from both blocks
    prev.appendGlyphs(block.state.glyphs)

    // remove given block
    this.setState({
      blocks: this.state.blocks.slice(0, previousBlock)
        .concat(this.state.blocks.slice(previousBlock + 1)),
      currentBlock: previousBlock
    })
  }

  mergeWithNextBlock(block) {
    let nextBlock
    Object.keys(this.refs).forEach((ref, index) => {
      if (this.refs[ref] === block) {
        nextBlock = index + 1
      }
    })

    if (nextBlock >= this.state.blocks.length) return

    const next = this.refs['item' + nextBlock]
    // merge glyphs
    block.appendGlyphs(next.state.glyphs)

    // remove next block
    this.setState({
      blocks: this.state.blocks.slice(0, nextBlock - 1)
        .concat(this.state.blocks.slice(nextBlock))
    })
  }

  // componentDidUpdate = (prevProps, prevState) => {
  //
  // }

  addGlyph = (e) => {
    // console.log(this.refs)
    this.refs['item' + this.state.currentBlock].addGlyph(e)
  }
  removePreviousGlyph = (e) => {
    this.refs['item' + this.state.currentBlock].removePreviousGlyph(e)
  }
  removeNextGlyph = (e) => {
    this.refs['item' + this.state.currentBlock].removeNextGlyph(e)
  }
  moveCursor = (direction) => {
    const current = this.refs['item' + this.state.currentBlock]

    switch (direction) {
    case 'up':
      if (this.refs['item' + this.state.currentBlock].moveCursor(direction)) {
        const previousBlock = this.state.currentBlock - 1
        if (previousBlock < 0) return

        const prev = this.refs['item' + previousBlock]
        prev.setCursorPosition(current.state.cursorPos, 'up')
        current.setCursorPosition(0)

        this.setState({
          currentBlock: previousBlock
        })
      }
      break

    case 'down':
      if (this.refs['item' + this.state.currentBlock].moveCursor(direction)) {
        const nextBlock = this.state.currentBlock + 1
        if (nextBlock === this.state.blocks.length) return

        const next = this.refs['item' + nextBlock]
        next.setCursorPosition(current.state.cursorPos, 'down')
        current.setCursorPosition(0)

        this.setState({
          currentBlock: nextBlock
        })
      }
      break

    case 'pageup':
      const first = this.refs['item0']
      first.setCursorPosition(0)
      current.setCursorPosition(0)
      this.setState({
        currentBlock: 0
      })
      break

    case 'pagedown':
      const last = this.refs['item' + (this.state.blocks.length - 1)]
      last.setCursorPosition(last.state.glyphs.length - 1)
      current.setCursorPosition(0)
      this.setState({
        currentBlock: this.state.blocks.length - 1
      })
      break

    default:
      this.refs['item' + this.state.currentBlock].moveCursor(direction)
    }
  }

  componentDidMount() {
    const bodyElt = document.body
    // ReactDOM.findDOMNode(this)
    //   .offsetParent
    bodyElt.addEventListener('keydown', function(e) {
      console.log(e)
      switch(e.keyCode) {
        case 8:
          this.removePreviousGlyph()
          break

        case 46:
          this.removeNextGlyph()
          break

        // pageup
        case 33:
          this.moveCursor('pageup')
          break

        // pagedown
        case 34:
          this.moveCursor('pagedown')
          break

        // end
        case 35:
          this.moveCursor('end')
          break

        // home
        case 36:
          this.moveCursor('home')
          break

        // left
        case 37:
          this.moveCursor('left')
          break

        // up
        case 38:
          this.moveCursor('up')
          break

        // right
        case 39:
          this.moveCursor('right')
          break

        // down
        case 40:
          this.moveCursor('down')
          break
      }
    }.bind(this))

    bodyElt.addEventListener('keypress', function (e) {
      // console.log(e)
      this.addGlyph(e)
    }.bind(this))
  }
  // handleMouseUp = (e) => {
  //   var range = getSelection().getRangeAt(0)
  //   console.log(range);
  //   console.log(range.toString())
  //   // console.log(this.refs)
  //   let node = range.startContainer.parentNode
  //   do {
  //     let child = this.getChild(node)
  //     if (child)
  //       child.setSelected(true)
  //
  //     node = getNextNode(node, false, range.endContainer.parentNode)
  //   } while (node)
  // }
  // handleKeyDown = (e) => {
  //   console.log(e)
  // }
  // getChild(node) {
  //   let res = null
  //   Object.keys(this.refs).forEach((ref, index) => {
  //     // console.log(ref)
  //     if (this.refs[ref].isNode(node)) {
  //       res = this.refs[ref]
  //     }
  //   })
  //   return res
  // }
}

module.exports = Main
