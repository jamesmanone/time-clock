import * as React from 'react';
import connect from 'state';
import { Listener } from 'Model/index';
import { RouterProps } from 'Router/index';
import LoginForm from './LoginForm';

import IModel from 'Model/index';

interface Props extends RouterProps {
  login: IModel["login"];
  isLoggedIn: boolean;
}

interface State {
  username: string;
  password: string;
}

class Login extends React.PureComponent<Props> {
  state: State = {
    username: '',
    password: ''
  };

  onLogin = (success: boolean): void => {
    if(success) this.props.navigate('/employees');
  };

  onChangeUsername = (evt: React.ChangeEvent<HTMLInputElement>): void =>
    this.setState({username: evt.target.value.trim()});

  onChangePassword = (evt: React.ChangeEvent<HTMLInputElement>): void =>
    this.setState({password: evt.target.value.trim()});

  onSubmitLogin = evt => {
    evt.preventDefault();
    let { username, password } = this.state;
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if(iOS) {
      const username = (document.getElementById('username') as HTMLInputElement).value;
      const password = (document.getElementById('password') as HTMLInputElement).value;
    }
    if(!(username && password)) return;
    this.props.login({username, password}, this.onLogin);
  }

  render() {
    return (
      <LoginForm
        {...this.state}
        onChangePassword={this.onChangePassword}
        onChangeUsername={this.onChangeUsername}
        onSubmitLogin={this.onSubmitLogin}
      />
    );
  }
}

export default connect(
  (model: IModel) => ({isLoggedIn: model.getLogin}),
  ({login}) => ({login}))(Login);
