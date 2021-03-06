import * as React from 'react';
import connect from 'state';
import Employee from 'Model/Employee';
import Model, { IModel } from 'Model/index';
import { RouterProps } from 'Router/index';

import { Breadcrumb, BreadcrumbItem } from 'reactstrap';

import UpdatableField from './UpdatableField';
import ShiftInfo from './ShiftInfo';


interface Props extends RouterProps {
  employee: Employee;
  updateEmployee: IModel["updateEmployee"];
  removeEmployee: IModel["removeEmployee"];
}

type State = {
  isEditingName?:boolean;
  isEditingRate?:boolean;
};

class EmployeePage extends React.PureComponent<Props> {
  state: State = {};

  updateName = (newName:string): void => {
    if(!newName) return alert('Employees are people; people have names');
    const employee = this.props.employee.clone();
    employee.name = newName;
    this.props.updateEmployee(employee)
  }

  updateHourly = (newRate:string):void => {
    let hourlyRate = parseFloat(newRate);
    if(!hourlyRate) alert('Slavery is over! You have to pay these people.');
    const employee = this.props.employee.clone();
    employee.hourlyRate = hourlyRate;
    this.props.updateEmployee(employee);
  }

  navToEmployees = (evt: React.MouseEvent<HTMLAnchorElement>): void => {
    evt.preventDefault();
    this.props.navigate('/employees');
  }

  render() {
    if(this.props.employee) return (
      <div>
        <Breadcrumb>
          <BreadcrumbItem>
            <a
              href="/employees"
              onClick={this.navToEmployees}
            >
              Employees
            </a>
          </BreadcrumbItem>
          <BreadcrumbItem active>
            {this.props.employee.name.split(' ')[0]}
          </BreadcrumbItem>
        </Breadcrumb>
        <ShiftInfo
          employee={this.props.employee}
          navigate={this.props.navigate}
          updateName={this.updateName}
          updateHourly={this.updateHourly}
        />
      </div>
    )
    return <div />
  }

}

export default connect(
  (model: Model, props) => {
    let employeeId = /\/employee\/([^/]+)\/?/.exec(props.path)[1];
    return { employee: model.getEmployee(employeeId) };
  },
  ({updateEmployee, removeEmployee}) => ({updateEmployee, removeEmployee})
)(EmployeePage);
