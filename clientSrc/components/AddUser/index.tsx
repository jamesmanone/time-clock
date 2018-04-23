import * as React from 'react';
import connect from 'state';
import Model from 'Model/index';
import { RouterProps } from 'Router/index';

import AddForm from './AddForm';

interface Props extends RouterProps {
  addUser: Model["addUser"];
}

type State = {
  username: string;
  password: string;
}


class AddUser extends React.PureComponent<Props> {
  state: State = {
    username: '',
    password: ''
  };

  componentDidMount() {
    (!!history.state && this.setState({...history.state}));
  }

  onChange = (field: string) =>
    (evt: React.ChangeEvent<HTMLInputElement>) =>
      this.setState({[field]: evt.target.value.trim()}, ()=>
        history.replaceState({...this.state}, '')
      );

  onSuccess = () => {
    this.props.navigate('/employees');
  }

  onSubmit = (evt: React.MouseEvent<HTMLButtonElement>|React.KeyboardEvent<HTMLInputElement>) => {
    evt.preventDefault();
    const { username, password } = this.state;
    if(!(username && password)) return alert('All Fields Required');
    this.props.addUser({username, password}, this.onSuccess)
  }

  render() {
    return (
      <AddForm
        {...this.state}
        onChange={this.onChange}
        onSubmit={this.onSubmit}
      />
    );
  }

}

export default connect(
  undefined,
  ({addUser}) => ({addUser})
)(AddUser);
