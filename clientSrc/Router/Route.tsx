import * as React from 'react';
import { withRouter, RouterProps } from './index';

interface Props extends RouterProps {
  to: string|RegExp;
  component?: React.ComponentType<any>;
  canActivate?: boolean;
  exact?: boolean;
  children?: JSX.Element;
}

class Route extends React.PureComponent<Props> {
  state: {active: boolean} = {active: false};

  static defaultProps = {
    canActivate: true,
    exact: false
  };

  static getDerivedStateFromProps(next: Props, _: any) {
    if(!(next.to && next.path)) return {active: false};
    if(next.to instanceof RegExp) return {
      active: next.to.test(next.path)
    }
    else if(!next.exact) return {
      active: next.path.toLowerCase().startsWith(next.to.toLowerCase()) &&
              next.canActivate !== false
    };
    else return {
      active: next.path === next.to && next.canActivate !== false
    };
  }

  render() {
    if(this.state.active && this.props.component)
      return <this.props.component path={this.props.path} navigate={this.props.navigate} />;
    else if(this.state.active && this.props.children)
      return this.props.children;
    else return <div />;
  }
}

export default withRouter(Route);
