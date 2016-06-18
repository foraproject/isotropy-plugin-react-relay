import React from "react";

export default class MyComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <html><body>Hello {this.props.ship ? this.props.ship.name : this.props.name}</body></html>;
  }
}
