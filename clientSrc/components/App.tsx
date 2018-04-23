import * as React from 'react';

import Navbar from 'components/common/NavBar/index';
import Router from './Routes';

export default class App extends React.PureComponent {
  render() {
    return (
      <div>
        <Navbar />
        <Router />
      </div>
    )
  }
}
