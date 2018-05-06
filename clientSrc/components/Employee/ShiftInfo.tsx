import * as React from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  CardText,
  Table,
  Col
} from 'reactstrap';
import Employee from 'Model/Employee';

import UpdatableField from './UpdatableField';
import CurrentWeek from './CurrentWeek';

interface Props {
  employee: Employee;
  navigate: (route: String)=>void;
  updateName: (newName:string)=>void;
  updateHourly: (newRate:string)=>void;
}

type State = {timer:number; thisWeek:string};

// class ShiftInfo extends React.PureComponent<Props> {
//   state: State;
//
//   constructor(props: Props) {
//     super(props);
//
//   }
// }

const ShiftInfo = (props: Props) => (
  <Card>
    <form className='form-inline'>
      <div className="form-row">
        <UpdatableField
          id="name"
          value={props.employee.name}
          update={props.updateName}
          label="Name"
        />
        <Col md="4" />
        <UpdatableField
          id="hourly-rate"
          value={props.employee.hourlyRate.toFixed(2)}
          update={props.updateHourly}
          label="Hourly Rate"
        />
      </div>
    </form>
    <CardBody>
      <Table hover>
        <thead>
          <tr>
            <th>Weeks ago</th>
            <th>Hours Worked</th>
            <th>Pay For Week</th>
          </tr>
        </thead>
        <tbody>
          {props.employee.fourWeekInfo().map(week => {
            if(week.key == 0) return (
              <CurrentWeek
                employee={props.employee}
                navigate={props.navigate}
                key={0}
              />
            );
            else return (
              <tr key={week.key} onClick={
                ()=>props.navigate(`/employee/${props.employee._id}/week${week.key}`)
              }>
                <td>{week.key}</td>
                <td>{week.hours}</td>
                <td>{`\$${week.pay}`}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </CardBody>
  </Card>
);

export default ShiftInfo;
