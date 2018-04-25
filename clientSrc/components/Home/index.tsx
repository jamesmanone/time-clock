import * as React from 'react';
import { RouterProps } from 'Router/index';
import { Button } from 'reactstrap';
import connect from 'state';


interface Props extends RouterProps {
  isLoggedIn: boolean;
}

class Home extends React.PureComponent<Props> {
  componentDidMount() {
    if(this.props.isLoggedIn) this.props.navigate('/employees');
  }

  componentDidUpdate() {
    if(this.props.isLoggedIn) this.props.navigate('/employees');
  }

  navigate = () => this.props.navigate('/login');

  render() {
    return <Button onClick={this.navigate}>Login</Button>;
  }
}

export default connect(
	({getLogin}) => ({isLoggedIn: getLogin})
)(Home);
