import * as React from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  CardText,
  Table
} from 'reactstrap';
import Employee from 'Model/Employee';

interface Props {
  employee: Employee;
  navigate: (route: String)=>void;
}

const ShiftInfo = (props: Props) => (
  <Card>
    <CardTitle>Last Four Weeks</CardTitle>
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
          {props.employee.fourWeekInfo().map(week => (
            <tr key={week.key} onClick={
              ()=>props.navigate(`/employee/${props.employee._id}/week${week.key}`)
            }>
              <td>{week.key || 'This Week'}</td>
              <td>{week.hours}</td>
              <td>{`\$${week.pay}`}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </CardBody>
  </Card>
);

export default ShiftInfo;
