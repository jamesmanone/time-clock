import * as React from 'react';

import Router from './Router';

const { Provider, Consumer } = React.createContext(new Router());

export interface RouterProps {
  path: string;
  navigate: (path:string)=>void;
}

export const BrowserRouter = Provider;

export const withRouter = (Child: React.ComponentClass<any>) =>
  class WithRouter extends React.PureComponent<any> {
    state: {path:string} = {path: '/'};
    private router: Router;
    private subscription: string;

    static displayName = `WithRouter(${Child.displayName || Child.name})`

    componentWillUnmount() {
      this.unsubscribe();
    }

    unsubscribe = () =>
      this.router && this.router.unsubscribe(this.subscription);

    updatePath = (path:string) => this.setState({path});

    render() {
      return (
        <Consumer>
          {(router: Router) => {
            this.unsubscribe();
            this.router = router;
            this.subscription = router.subscribe(this.updatePath);
            return <Child {...this.props} path={this.state.path} navigate={router.navigate} />
          }}
        </Consumer>
      );
    }
  }
