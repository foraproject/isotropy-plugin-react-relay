import Relay from 'react-relay';

export default class extends Relay.Route {
  static queries = {
    ship: () => Relay.QL`
    query getShip { ship(id: $id) }
    `
  };
  static routeName = 'MyRelayRoute';
}
