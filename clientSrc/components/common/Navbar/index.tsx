import * as React from 'react';

import IModel from 'Model/index';

import {
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Collapse,
  Nav,
  Button
} from 'reactstrap';

import Wrapper from 'state';
import { withRouter, RouterProps } from 'Router/index';

import NavLink from './NavLink';

type plainObject = { [key:string]: any };

interface Props extends RouterProps {
  isLoggedIn: boolean;
  [key: string]: any;
}

type State = {isOpen: boolean, path: string};

class NavBar extends React.PureComponent<Props, any> {
  state: State = { isOpen: false, path: '/' };

  navigate = (evt) => {
    evt.preventDefault();
    this.props.navigate(evt.target.attributes.href.value);
  }

  logout = (evt) => {
    evt.preventDefault();
    this.props.logout(()=>this.props.navigate('/login'));
  }

  static getDerivedStateFromProps(next: Props, state: State) {
    if(next.path !== state.path) return {isOpen: false, path: next.path}
    else return null;
  }

  toggle = () => this.setState(state => ({isOpen: !state.isOpen}));



  render() {
    return (
      <Navbar className='mb5 sticky-top' color="dark" expand="md" dark>
        <NavbarBrand href='/' onClick={this.navigate}>
          Time Clock
        </NavbarBrand>
        <NavbarToggler onClick={this.toggle} />
        <Collapse isOpen={this.state.isOpen} navbar={true}>
          {(this.props.isLoggedIn && (
            <Nav className="mr-auto" navbar={true}>
              <NavLink to="/employees/add" path={this.props.path} navigate={this.navigate}>
                Add Employee
              </NavLink>
              <NavLink to="/employees" path={this.props.path} navigate={this.navigate}>
                Employees
              </NavLink>
              <NavLink to="/adduser" path={this.props.path} navigate={this.navigate}>
                Add User
              </NavLink>
              <NavLink to="/login" path={this.props.path} navigate={this.logout}>
                <strong>Logout</strong>
              </NavLink>
            </Nav>
          ) || (
            <Nav className="mr-auto" navbar>
              <NavLink to="/login" path={this.props.path} navigate={this.navigate}>
                Login
              </NavLink>
            </Nav>
          ))}
        </Collapse>
      </Navbar>
    )
  }


}

export default withRouter(Wrapper(
  (model: IModel) => ({isLoggedIn: model.getLogin}),
  (model: IModel) => ({logout: model.logout})
)(NavBar));
