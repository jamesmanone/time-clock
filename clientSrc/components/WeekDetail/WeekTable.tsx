import * as React from 'react';
import {
  Table,
  Card,
  CardBody,
  CardTitle
} from 'reactstrap';

import Employee from 'Model/Employee';
import Shift from 'Model/Shift';

import ShiftLine from './ShiftLine';

interface Props {
  name: string;
  start: Date;
  end: Date;
  shifts: Shift[];
  updateShift: (shift: Shift)=>void;
}

const WeekTable = (props: Props) => (
  <Card>
    <div>
      <h3>{props.name}</h3>
      <h4>
        {props.start.toLocaleDateString()} - {props.end.toLocaleDateString()}
      </h4>
    </div>
    <CardBody>
      <Table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>
          {(props.shifts && props.shifts.reverse().map(shift =>
            <ShiftLine
              shift={shift}
              key={shift._id}
              updateShift={props.updateShift}
            />
          ))}
        </tbody>
      </Table>
    </CardBody>
  </Card>
);

export default WeekTable;
