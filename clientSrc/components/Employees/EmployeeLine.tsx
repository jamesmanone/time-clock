import * as React from 'react';
import { Button } from 'reactstrap';

import Employee from 'Model/Employee';
import Model from 'Model/index';

interface Props {
  employee: Employee;
  startShift: Model["startShift"];
  endShift: Model["endShift"];
  navigate: ()=>void;
}

type State = {duration: string, week: string};


export default class EmployeeLine extends React.PureComponent<Props> {
  state: State;
  timer: number;

  constructor(props: Props) {
    super(props);
    if(props.employee.activeShift) {
      this.timer = window.setInterval(() => {
          this.setState({
            duration: this.props.employee.activeShift.readableDuration(),
            week: this.props.employee.readableHoursForWeek()
          })
        }, 1000);
    }
    this.state = {
      duration: '',
      week: this.props.employee.readableHoursForWeek()
    };

  }

  componentDidUpdate() {
    if(!this.timer && this.props.employee.activeShift) {
      this.timer = window.setInterval(() => {
          this.setState({
            duration: this.props.employee.activeShift.readableDuration(),
            week: this.props.employee.readableHoursForWeek()
          })
        }, 1000);
    } else if(this.timer && !this.props.employee.activeShift) {
      window.clearInterval(this.timer);
      this.timer = undefined
    }
  }

  static getDerivedStateFromProps(next: Props, state: State) {
    if(!next.employee.activeShift && state.duration) return {duration:''};
    else return {};
  }

  componentWillUnmount() {
    if(this.timer) window.clearTimeout(this.timer);
  }

  startShift = () => {
    this.props.startShift(this.props.employee._id)
    this.timer = window.setInterval(() => {
        this.setState({
          duration: this.props.employee.activeShift.readableDuration(),
          week: this.props.employee.readableHoursForWeek()
        })
      }, 1000)
  }

  endShift = () => {
    const shiftid = {
      employee: this.props.employee._id,
      shift: this.props.employee.activeShift._id
    };
    this.props.endShift(shiftid);
    window.clearTimeout(this.timer);
  }

  navigate = (evt) => {
    if(evt.target.type !== 'button') this.props.navigate();
  }

  render() {
    return (
      <tr onClick={this.navigate}>
        <td>{this.props.employee.name}</td>
        <td>{this.state.duration}</td>
        <td>{this.props.employee.readableHoursForWeek()}</td>
        {(window.innerWidth > 480 && (
          <td>
            {`\$${this.props.employee.payForWeek()}`}
          </td>
        ))}
        <td>
          <div className="btn-group">
            <Button
              color="danger"
              size="sm"
              disabled={!this.props.employee.activeShift}
              onClick={this.endShift}
            >
              End
            </Button>
            <Button
              color="success"
              size="sm"
              disabled={!!this.props.employee.activeShift}
              onClick={this.startShift}
            >
              Start
            </Button>
          </div>
        </td>
      </tr>
    );
  }
}




// const EmployeeLine = (props) => {
//   const activeShifts = props.shifts.filter(shift => !shift.end);
//
//   const getShiftLengthString = ():string => {
//     if(!activeShifts.length) return '';
//     const activeShift = activeShifts[0];
//     const duration = (Date.now() - activeShift.start)/1000;
//     const hours = (duration)
//   }
//   return (
//     <tr>
//       <td>{props.name}</td>
//       <td>
//         {}
//       </td>
//     </tr>
//   );
// }
