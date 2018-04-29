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
}

const ShiftInfo = (props: Props) => (
  <Card>
    <CardTitle>Last Four Weeks</CardTitle>
    <CardBody>
      <Table>
        <thead>
          <tr>
            <th>Weeks ago</th>
            <th>Hours Worked</th>
            <th>Pay For Week</th>
          </tr>
        </thead>
        <tbody>
          {props.employee.fourWeekInfo().map(week => (
            <tr key={week.key}>
              <td>{week.key}</td>
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
