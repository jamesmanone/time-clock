import * as React from 'react';
import {
  Input,
  Col,
  Label
} from 'reactstrap';
import StyledInput from '../common/StyledInput';


interface Props {
  value: string;
  update: (name:string)=>void;
  id: string;
  label: string;
}

type State = {value:string, updating:boolean};

export default class UpdatableField extends React.PureComponent<Props> {
  state: State = {
    value: this.props.value,
    updating: false
  };

  onChange = (evt: React.ChangeEvent<HTMLInputElement>): void =>
    this.setState({value: evt.target.value});

  submit = (): void => {
    this.props.update(this.state.value);
    this.toggle();
  };

  toggle = () => {
    this.setState((state: State)=>
      ({
        updating: !state.updating,
        value: this.props.value
      }));
  }

  render() {
    if(this.state.updating) return (
      <Col sm="5" md="3" className="form-group">
        <Label for={this.props.id}><strong>{this.props.label}</strong></Label>
        <Input
          value={this.state.value}
          onChange={this.onChange}
          id={this.props.id}
          onKeyPress={(evt: React.KeyboardEvent<HTMLInputElement>) =>
            (evt.key === 'Enter' && this.submit())
          }
          onBlur={this.toggle}
          autoFocus
        />
      </Col>
    )
    else if(this.props.id == 'hourly-rate') return (
      <Col md="5" className='form-group'>
        <Label for={this.props.id}><strong>{this.props.label}</strong></Label>
        <input
          className="form-control-plaintext"
          readOnly
          value={`\$${this.props.value}/hr`}
          onClick={this.toggle}
        />
      </Col>
    );
    return (
      <Col md="5" className='form-group'>
        <Label for={this.props.id}><strong>{this.props.label}</strong></Label>
        <input
          className="form-control-plaintext"
          readOnly
          value={this.props.value}
          onClick={this.toggle}
        />
      </Col>
    )
  }
}
