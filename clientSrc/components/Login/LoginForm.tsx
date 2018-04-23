import * as React from 'react';

import {
  Card,
  CardBody,
  Button,
  Col,
  Row,
  Form
} from 'reactstrap';

import StyledInput from 'components/common/StyledInput';

interface Props {
  onChangePassword: (evt: React.ChangeEvent<HTMLInputElement>)=>void;
  onChangeUsername: (evt: React.ChangeEvent<HTMLInputElement>)=>void;
  onSubmitLogin: (evt)=>void;
  username: string;
  password: string;
}

const LoginForm = (props:Props) => (
  <Card>
    <CardBody>
      <div className="form-header"><h3>Login</h3></div>
      <Form onSubmit={props.onSubmitLogin}>
        <StyledInput
          id="username"
          value={props.username}
          onChange={props.onChangeUsername}
          autoCapitalize="none"
        >
          Username
        </StyledInput>
        <StyledInput
          id="password"
          value={props.password}
          onChange={props.onChangePassword}
          type="password"
          onKeyPress={(evt: React.KeyboardEvent<HTMLInputElement>)=>
            (evt.key == 'Enter' && props.onSubmitLogin(evt))
          }
        >
          Password
        </StyledInput>
        <Button className="pull-right" onClick={props.onSubmitLogin}>
          Login
        </Button>
      </Form>
    </CardBody>
  </Card>
);

export default LoginForm;
