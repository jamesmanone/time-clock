import * as React from 'react';
import {
  Input
} from 'reactstrap';

interface Props {
  value: Date;
  update: (newDate: Date)=> void;
  id: string;
}

type State = {
  value: string;
  edit: boolean;
};

export default class UpdatableTime extends React.PureComponent<Props> {
  state: State = {value:'', edit:false};

  static getDerivedStateFromProps(next: Props) {
    return {value: next.value.toLocaleTimeString()}
  }

  onChange = (evt: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({value: evt.target.value});

  onSubmit = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if(evt.key === 'Esc') return this.toggle();
    if(evt.key !== 'Enter') return;

    // 12/24 hr, seconds optional
    const parser = /^(\d{1,2}):(\d{2}):?(\d\d)?\s?(AM|PM)?/;
    const milParser = /^(\d{2})(\d{2})$/
    const parsedField = parser.exec(this.state.value) || milParser.exec(this.state.value);
    if(!parsedField)
      return alert('Time must be formated "hh:mm(:ss) (AM/PM)" or "hhmm"(24h clock)');

    let hours = parseInt(parsedField[1]);
    if(parsedField[4] === 'PM') hours += 12;
    else if(parsedField[4] === 'AM' && hours === 12) hours = 0;

    const minutes = parseInt(parsedField[2]),
          seconds = parseInt(parsedField[3]);

    const date = new Date(this.props.value);
    date.setHours(hours);
    date.setMinutes(minutes);
    if(seconds || seconds === 0) date.setSeconds(seconds);
    else date.setSeconds(0);
    this.props.update(date);
    this.toggle();
  }

  toggle = () => this.setState((state: State): State=>({
    edit: !state.edit,
    value: this.props.value.toLocaleTimeString()
  }));

  render() {
    if(!this.state.edit) return (
      <td onClick={this.toggle}>{this.props.value.toLocaleTimeString()}</td>
    );

    return (
      <Input
        value={this.state.value}
        onChange={this.onChange}
        id={this.props.id}
        onKeyPress={this.onSubmit}
        onBlur={this.toggle}
        autoFocus
      />
    )
  }
}
