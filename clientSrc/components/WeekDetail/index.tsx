import * as React from 'react';
import connect from 'state';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';

import { RouterProps } from 'Router/index';
import Employee from 'Model/Employee';
import Shift from 'Model/Shift';
import Model from 'Model/index';

import WeekTable from './WeekTable';


interface Props extends RouterProps {
  employee: Employee;
  updateShift: Model["updateShift"];
}

type State = {week?: Shift[], back?: number}

class WeekDetail extends React.PureComponent<Props> {
  static route: RegExp = /\/employee\/([^/]+)\/week([0-9]+)/;

  state: State = {};

  static getDerivedStateFromProps(next: Props) {
    const match = WeekDetail.route.exec(next.path);
    if(next.employee) return {
      week: next.employee.getPastWeekShifts(parseInt(match[2])),
      back: parseInt(match[2])
    };
    return {}
  }

  updateShift = (shift) => this.props.updateShift({
    shift: shift._id,
    employee: this.props.employee._id
  }, shift.start, shift.end);

  navigate = (route: string) => (evt: React.MouseEvent<HTMLAnchorElement>): void => {
    evt.preventDefault();
    this.props.navigate(route);
  }

  render() {
    if(this.props.employee) {
      const { start, end } = this.props.employee.getDatesForBackWeek(this.state.back);
      return (
        <div>
          <Breadcrumb>
            <BreadcrumbItem>
              <a href="/employees" onClick={this.navigate('/employees')}>
                Employees
              </a>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <a
                href={`/employee/${this.props.employee._id}`}
                onClick={this.navigate(`/employee/${this.props.employee._id}`)}
              >
                {this.props.employee.name.split(' ')[0]}
              </a>
            </BreadcrumbItem>
            <BreadcrumbItem active>
              {(!this.state.back && 'This Week' || `${this.state.back} week${(this.state.back > 1 && 's' || '')} ago`)}
            </BreadcrumbItem>
          </Breadcrumb>
          <WeekTable
            name={this.props.employee.name}
            start={start}
            end={end}
            shifts={this.state.week}
            updateShift={this.updateShift}
          />
        </div>
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
  },
  ({updateShift})=>({updateShift})
)(WeekDetail);
