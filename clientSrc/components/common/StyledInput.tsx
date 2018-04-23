import * as React from 'react';
import {
  FormGroup,
  Input,
  Label
} from 'reactstrap';

import { InputProps } from 'node_modules/@types/reactstrap/lib/input.d';


export default class StyledInput extends React.PureComponent<InputProps> {
  state: {notEmpty:boolean};
  constructor(props) {
    super(props);
    this.state = {notEmpty:this.props.value !== ''};
  }

  static getDerivedStateFromProps(next: InputProps, state: {notEmpty:boolean}) {
    if(next.value !== '' && !state.notEmpty) return {notEmpty: true};
    else if(next.value == '' && state.notEmpty) return {notEmpty: false};
    else return {};
  }

  onFocus = () => this.setState({notEmpty:true});

  onBlur = () => this.setState({notEmpty:this.props.value !== ''});

  passedProps = (): InputProps => ({...this.props, children: undefined})

  render() {
    return (
      <FormGroup>
        <Input {...this.passedProps()} onFocus={this.onFocus} onBlur={this.onBlur}/>
        <Label className={this.state.notEmpty ? "not-empty" : ""}>
          {this.props.children}
        </Label>
      </FormGroup>
    );
  }
}
