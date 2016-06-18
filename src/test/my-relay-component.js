import React from 'react';
import Relay from 'react-relay';
import MyComponent from "./my-component";


export default Relay.createContainer(
  MyComponent,
  {
    fragments: {
      ship: () => Relay.QL`
      fragment on Ship {
        name
      }
      `,
    }
  }
);
