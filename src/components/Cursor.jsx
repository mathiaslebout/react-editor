const React = require('react')

class Cursor extends React.Component {
  state = {
    value: ''
  }
  render() {
    console.log('Rendering Cursor')
    // return <input
    //   type="text"
    //   value={this.state.value}
    //   onChange={this.handleChange}>
    // </input>
    return <span
      style={{left: '-3px'}}
      className="blinking-cursor"
      onKeyPress={this.handleKeyPress}>|</span>
  }
  handleChange = (e) => {
    console.log(e.target.value)
    this.props.addGlyph(e.target.value)
    this.setState({
      value: ''
    })
  }
  handleKeyPress = (e) => {
    console.log(e)
  }
}

module.exports = Cursor
