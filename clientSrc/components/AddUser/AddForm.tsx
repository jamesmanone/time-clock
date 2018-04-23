import * as React from 'react';
import {
  Card,
  CardBody,
  Button,
  Form
} from 'reactstrap';
import StyledInput from 'components/common/StyledInput';

interface Props {
  username: string;
  password: string;
  onChange: (field:string)=>(evt:React.ChangeEvent<HTMLInputElement>)=>void;
  onSubmit: (evt:React.MouseEvent<HTMLButtonElement>|React.KeyboardEvent<HTMLInputElement>)=>void;
}

const AddForm = (props: Props) => (
  <Card>
    <CardBody>
      <div className="form-header">
        <h3>Add User</h3>
      </div>
      <Form>
        <StyledInput
          id="username"
          value={props.username}
          onChange={props.onChange('username')}
        >
          Username
        </StyledInput>

        <StyledInput
          id="password"
          type="password"
          value={props.password}
          onChange={props.onChange('password')}
          onKeyPress={(evt: React.KeyboardEvent<HTMLInputElement>) =>
            (evt.key === 'Enter' && props.onSubmit(evt))
          }
        >
          Password
        </StyledInput>
        <Button className="pull-right" onClick={props.onSubmit}>
          Add User
        </Button>
      </Form>
    </CardBody>
  </Card>
);

export default AddForm;
