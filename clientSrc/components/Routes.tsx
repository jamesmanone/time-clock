import * as React from 'react';

import IModel from 'Model/index';

import connect from 'state';
import Route from 'Router/Route';

import Home from './Home/index';
import Login from './Login/index';
import Employees from './Employees/index';
import AddUser from './AddUser/index';
import EmployeePage from './Employee/index';

interface Props {
  isLoggedIn: boolean;
}

class Routes extends React.PureComponent<Props> {
  render() {
    return (
      <div className="container">
        <Route
          to="/"
          component={Home}
          exact
        />

        <Route
          to="/login"
          component={Login}
          canActivate={!this.props.isLoggedIn}
          exact
        />

        <Route
          to="/employees"
          component={Employees}
          canActivate={this.props.isLoggedIn}
        />

        <Route
          to="/adduser"
          component={AddUser}
          canActivate={this.props.isLoggedIn}
          exact
        />

        <Route
          to={/\/employee\/([^/]+)\/?/}
          component={EmployeePage}
          canActivate={this.props.isLoggedIn}
        />
      </div>
    );
  }
}

export default connect(
  (model: IModel) => ({isLoggedIn: model.getLogin})
)(Routes);
