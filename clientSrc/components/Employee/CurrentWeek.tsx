import * as React from 'react';
import Employee from 'Model/Employee';

interface Props {
  navigate: (route:string)=>void;
  employee: Employee;
}

type State = {
  timer: number;
  duration: string;
  payForWeek: string;
}

export default class CurrentWeek extends React.PureComponent<Props> {
  state: State;

  constructor(props: Props) {
    super(props);
    let timer: number;
    if(this.props.employee.activeShift) timer = this.setTimer();
    this.state = {
      timer,
      duration: this.props.employee.readableHoursForWeek(),
      payForWeek: this.props.employee.payForWeek()
    };
  }

  setTimer = (): number => window.setInterval(()=>
    this.setState({
      duration: this.props.employee.readableHoursForWeek(),
      payForWeek: this.props.employee.payForWeek()
    }), 1000
  );

  componentWillUnmount() {
    if(this.state.timer) window.clearInterval(this.state.timer);
  }

  componentDidUpdate() {
    if(this.state.timer && ! this.props.employee.activeShift) {
      window.clearInterval(this.state.timer);
      this.setState({timer: null});
    }
    else if(!this.state.timer && this.props.employee.activeShift) {
      this.setState({timer: this.setTimer()});
    }
  }

  render() {
    return (
      <tr
        onClick={
          ()=>this.props.navigate(`/employee/${this.props.employee._id}/week0`)
        }
      >
        <td>This Week</td>
        <td>{this.state.duration}</td>
        <td>{`\$${this.state.payForWeek}`}</td>
      </tr>
    );
  }
}
