import * as React from 'react';
import {
  Card,
  CardBody,
  Form,
  Button
} from 'reactstrap';
import StyledInput from 'components/common/StyledInput';


interface Props {
  name: string;
  hourlyRate: string;
  onChange: (field: string)=>(evt: React.ChangeEvent<HTMLInputElement>)=>void;
  onSubmit: (evt: React.MouseEvent<HTMLButtonElement>)=>void;
  close: ()=>void
}

const AddForm = (props: Props) => (
  <Card>
    <CardBody>
      <div className="form-header">
        <h3>Add Employee</h3>
      </div>
      <Form>
        <StyledInput
          value={props.name}
          id="name"
          onChange={props.onChange('name')}
        >
          Name
        </StyledInput>
        <StyledInput
          value={props.hourlyRate}
          id="hourlyrate"
          onChange={props.onChange('hourlyRate')}
          onKeyPress={(evt: React.KeyboardEvent<HTMLInputElement>) =>
            (evt.key === 'Enter' && props.onSubmit(evt as any))
          }
        >
          Hourly Rate
        </StyledInput>
        <Button onClick={props.close}>Close</Button>
        <Button className="pull-right" onClick={props.onSubmit}>Add</Button>
      </Form>
    </CardBody>
  </Card>
);

export default AddForm;
