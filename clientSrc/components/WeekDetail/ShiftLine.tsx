import * as React from 'react';
import Shift from 'Model/shift';
import UpdateableTime from './UpdateableTime';

interface Props {
  shift: Shift;
  updateShift: (shift: Shift)=>void;
}

type State = {timer?: number, duration: string};

export default class ShiftLine extends React.PureComponent<Props> {
  state: State;

  constructor(props: Props) {
    super(props);
    let timer: number;
    if(!this.props.shift.end) timer = this.setTimer();
    this.state = {
      duration: this.props.shift.readableDuration(),
      timer
    };
  }

  setTimer = (): number =>
    window.setInterval(()=>
      this.setState({duration:this.props.shift.readableDuration()}), 1000);

  componentDidUpdate() {
    if(this.state.timer && this.props.shift.end) {
      window.clearInterval(this.state.timer);
      this.setState({timer: null});
    }
  }

  componentWillUnmount() {
    if(this.state.timer) window.clearInterval(this.state.timer);
  }

  getDay = (day: number): string => {
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

  updateShift = (field: string) => (date: Date): void => {
    const shift = {...this.props.shift, [field]: date};
    if(!(
      shift &&
      shift.start &&
      shift.end &&
      shift.start.getTime() < shift.end.getTime()
    )) return alert('Something went wrong');
    this.props.updateShift(shift);
  }

  render() {
    return (
      <tr>
        <td>{this.getDay(this.props.shift.start.getDay())}</td>
        <UpdateableTime
          value={this.props.shift.start}
          update={this.updateShift('start')}
          id="start"
        />
        {(this.props.shift.end && (
          <UpdateableTime
            value={this.props.shift.end}
            update={this.updateShift('end')}
            id="end"
          />
        )|| <td />)}
        <td>{this.state.duration}</td>
      </tr>
    );
  }
}


// const ShiftLine = (props: Props) => (

// );
//
// export default ShiftLine;
