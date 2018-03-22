import React, { Component } from "react";
import "./button-grid.scss";

export default class ButtonGrid extends Component {
  renderButtons(buttons) {
    return buttons.map((button, index) => {
      return (
        <button
          className="button"
          onClick={() => this.props.onButtonClick(button)}
          key={index}
        >
          {button}
        </button>
      );
    });
  }

  render() {
    return (
      <div className="button-grid">
        {this.renderButtons(this.props.buttons)}
      </div>
    );
  }
}
