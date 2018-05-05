import * as React from 'react';
import connect from 'state';

import { RouterProps } from 'Router/index';
import Employee from 'Model/Employee';
import Shift from 'Model/Shift';
import Model from 'Model/index';

import WeekTable from './WeekTable';


interface Props extends RouterProps {
  employee: Employee;
}

type State = {week?: Shift[], back?: number}

class WeekDetail extends React.PureComponent<Props> {
  static route: RegExp = /\/employee\/([^/]+)\/week([0-9]+)/;

  state: State = {};

  static getDerivedStateFromProps(next: Props) {
    const match = WeekDetail.route.exec(next.path);
    if(next.employee) return {
      week: next.employee.getPastWeekShifts(parseInt(match[2])),
      back: parseInt(match[1])
    };
    return {}
  }

  render() {
    if(this.props.employee) {
      const { start, end } = this.props.employee.getDatesForBackWeek(this.state.back);
      return (
        <WeekTable
          name={this.props.employee.name}
          start={start}
          end={end}
          shifts={this.state.week}
        />
      );
    }
    return <div />
  }
}

export default connect(
  (model: Model, ownProps: Partial<Props>) => {
    const match = WeekDetail.route.exec(ownProps.path);
    return {
      employee: model.getEmployee(match[1])
    }
  }
)(WeekDetail);
