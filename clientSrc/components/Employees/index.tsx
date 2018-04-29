import * as React from 'react';

import connect from 'state';
import { RouterProps } from 'Router/index';
import Employee from 'Model/employee';
import Model, { IModel } from 'Model/index';

import EmployeeList from './EmployeeList';
import Route from 'Router/Route';
import AddEmployee from '../AddEmployee/index';

import { Modal } from 'reactstrap';

export interface Props extends RouterProps {
  employees: Employee[];
  startShift: Model["startShift"];
  endShift: Model["endShift"];
  refresh: Model["refreshEmployees"];
  wsAvailable: boolean;
}

type State = {timer:number}

class Employees extends React.PureComponent<Props> {
  state: State = {timer: null};


  // Sets 1/min polling if no ws, disables if ws connection
  static getDerivedStateFromProps(next: Props, state: State) {
    if(!next.wsAvailable && !(state && state.timer)) {
      return {timer: window.setInterval(next.refresh, 60000)}
    } else if (next.wsAvailable && state && state.timer) {
      window.clearInterval(state.timer);
      return {timer: null};
    } else return {};
  }

  componentWillUnmount() {
    if(this.state.timer) window.clearInterval(this.state.timer);
  }

  closeAdd = (): void => this.props.navigate('/employees');

  openAdd = (): void => this.props.navigate('/employees/add');

  render() {
    if(this.props.employees) return (
      <div>
        <EmployeeList
          employees={this.props.employees}
          startShift={this.props.startShift}
          endShift={this.props.endShift}
          navigateToEmployee={this.props.navigate}
          openAdd={this.openAdd}
        />
        <Modal isOpen={this.props.path.includes('add')} toggle={()=>this.closeAdd}>
          <AddEmployee close={this.closeAdd} />
        </Modal>
      </div>
    );
    else return <div />
  }
}

export default connect(
  (model: IModel) => ({
    employees: model.getEmployees,
    wsAvailable: model.getWSStatus
  }),
  (model: IModel) => ({
    startShift: model.startShift,
    endShift: model.endShift,
    refresh: model.refreshEmployees
  })
)(Employees);
