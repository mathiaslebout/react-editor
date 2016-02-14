const React = require('react')
const ReactRouter = require('react-router')
const Link = ReactRouter.Link;

class Button extends React.Component {
  render() {
    return <a className="dropdown-item"
      onClick={this.handlerClick.bind(this)}>{this.props.display}</a>
  }

  handlerClick = (e) => {
    this.props.handlerClick(this.props.tag)
  }

}


class Navbar extends React.Component {
  static defaultProps = {
    headings: [
      {tag: 'h1', display: 'Heading 1'},
      {tag: 'h2', display: 'Heading 2'},
      {tag: 'h3', display: 'Heading 3'}
    ],
    blocks: [
      {tag: 'p', display: 'Paragraph'},
      {tag: 'div', display: 'Div'}
    ]
  }

  render() {
    return <div className="btn-group" role="group" aria-label="Button group with nested dropdown">
      <div className="btn-group" role="group">
        <button id="btnGroupDrop1" type="button" className="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Headings
        </button>
        <div className="dropdown-menu" aria-labelledby="btnGroupDrop1">
          {this.renderHeadings()}
        </div>
      </div>
      <div className="btn-group" role="group">
        <button id="btnGroupDrop2" type="button" className="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Blocks
        </button>
        <div className="dropdown-menu" aria-labelledby="btnGroupDrop2">
          {this.renderBlocks()}
        </div>
      </div>
    </div>
  }

  renderHeadings() {
    return this.props.headings.map((heading) => {
      return <Button
        key={heading.tag}
        display={heading.display}
        tag={heading.tag}
        handlerClick={this.handlerClick} />
    })
  }

  renderBlocks() {
    return this.props.blocks.map((block) => {
      return <Button
        key={block.tag}
        display={block.display}
        tag={block.tag}
        handlerClick={this.handlerClick} />
    })
  }

  handlerClick = (e) => {
    // console.log(e)
    this.props.onChangeHeader(e)
  }
}

module.exports = Navbar
