import * as React from 'react';
import connect from 'state';


import Model from 'Model/index';

import AddForm from './AddForm';

interface Props {
  addEmployee: Model["addEmployee"];
  close: ()=>void;
}

class AddEmployee extends React.PureComponent<Props> {
  state: {name: string, hourlyRate: string} = {
    name: '',
    hourlyRate: ''
  };

  componentDidMount() {
    (!!history.state && this.setState({...history.state}));
  }

  onChange = (field: 'name'|'hourlyRate') =>
    (evt: React.ChangeEvent<HTMLInputElement>) =>
      this.setState({[field]: evt.target.value}, ()=> {
        history.replaceState({...this.state}, '');
      });

  onSubmit = (evt: React.MouseEvent<HTMLButtonElement>) => {
    const { name, hourlyRate } = this.state;
    if(!name) return;
    const hourlyRateNumber = hourlyRate ? parseFloat(hourlyRate) : 0;
    this.props.addEmployee({name, hourlyRate: hourlyRateNumber}, this.onAddRejected(this.state));
    this.props.close();
  }

  onAddRejected = state => () => {
    history.back();
    alert(`There was a problem adding ${state.name} to the database`);
  }

  render() {
    return (
      <AddForm
        {...this.state}
        onChange={this.onChange}
        onSubmit={this.onSubmit}
        close={this.props.close}
      />
    );
  }


}

export default connect(
  undefined,
  ({addEmployee}) => ({addEmployee})
)(AddEmployee);
