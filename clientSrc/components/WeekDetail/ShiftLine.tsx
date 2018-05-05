import * as React from 'react';
import Shift from 'Model/shift';

interface Props {
  shift: Shift;
}

const getDay = (day: number): string => {
  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];
  return dayNames[day];
}

const ShiftLine = (props: Props) => (
  <tr>
    <td>{getDay(props.shift.start.getDay())}</td>
    <td>{props.shift.start.toLocaleTimeString()}</td>
    <td>{props.shift.end.toLocaleTimeString()}</td>
    <td>{props.shift.readableDuration()}</td>
  </tr>
);

export default ShiftLine;
