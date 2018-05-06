import * as React from 'react';
import Employee from 'Model/Employee';

import {
  Row,
  Col,
  Table,
  Button,
  Card,
  CardBody,
  Breadcrumb,
  BreadcrumbItem
} from 'reactstrap'

import EmployeeLine from './EmployeeLine';
import Model from 'Model/index';

interface Props {
  employees: Employee[]
  startShift: Model["startShift"];
  endShift: Model["endShift"];
  navigateToEmployee: (id:string)=>void;
  openAdd: ()=>void;
}

type State = {wideEnough: boolean}

export default class EmployeeList extends React.PureComponent<Props> {
  state={wideEnough: window.innerWidth > 480};

  constructor(props: Props) {
    super(props);
    window.addEventListener('resize', this.updateWidth);
    if(/(iPhone|iPad|iPod)/.test(navigator.platform))
      window.addEventListener('orientationchange', this.updateWidth)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWidth);
    if(/(iPhone|iPad|iPod)/.test(navigator.platform))
      window.removeEventListener('orientationchange', this.updateWidth)
  }

  updateWidth = () => {
    if(window.innerWidth > 480 && !this.state.wideEnough)
      this.setState({wideEnough:true});
    else if(window.innerWidth < 480 && this.state.wideEnough)
      this.setState({wideEnough: false});
  }

  render() {
    return (
      <div>
        <Breadcrumb>
          <BreadcrumbItem active>Employees</BreadcrumbItem>
        </Breadcrumb>
        <Card>
          <CardBody>
            <Button block onClick={this.props.openAdd}>
              Add Employee
            </Button>
            <Table hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Current Shift Length</th>
                  <th>Hours This Week</th>
                  {(this.state.wideEnough && (
                    <th>
                      Pay This Week
                    </th>
                  ))}
                  <th>Shift Control</th>
                </tr>
              </thead>
              <tbody>
                {
                  this.props.employees.map(em =>
                    <EmployeeLine
                      employee={em}
                      key={em._id}
                      startShift={this.props.startShift}
                      endShift={this.props.endShift}
                      navigate={()=>this.props.navigateToEmployee(`/employee/${em._id}`)}
                    />
                  )
                }
              </tbody>
            </Table>
          </CardBody>
        </Card>
      </div>
    );
  }
}
