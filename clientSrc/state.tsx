import * as React from 'react';

import Model from './Model/index';
import { Listener } from './Model/index';

const context = React.createContext(null);

export const Consumer = context.Consumer;
export const Provider = context.Provider;

interface stateMap {
  [key: string]: string;
}

interface preMap {
  [key: string]: (fn:Listener<any>)=>string;
}

interface methodMap {
    [key: string]: Function;
}

type stateMapper = (model:Model, ownProps: {[key:string]:any})=>preMap;
type functionMapper = (model:Model)=>methodMap;

const Wrapper = (mapProps?: stateMapper, mapMethods?: functionMapper) => (Child: React.ComponentClass<any>) =>
class Connect extends React.PureComponent<any, any> {
  private subscriptions: string[] = [];
  private model: Model;
  private methods: methodMap;

  state: {[key:string]:any} = {};

  componentDidMount() {}

  componentWillUnmount() {
    this.clearSubscriptions();
  }

  clearSubscriptions = () => {
    while(this.subscriptions.length) this.model.unsubscribe(this.subscriptions.pop());
  }

  subscribe = (propName:string) => (prop:any) => this.setState({ [propName]: prop });

  render() {
    return (
      <Consumer>
        {model => {
          if(!this.model) {
            this.model = model;
            const statemap: stateMap = {};
            const subs: preMap = mapProps ? mapProps(model, this.props) : undefined;
            if(subs) Object.keys(subs).map(key =>
              statemap[key] = subs[key](this.subscribe(key))
            );
            this.subscriptions = Object.values(statemap);

            this.methods = mapMethods ? mapMethods(model) : undefined;
          }

          return <Child {...this.props} {...this.state} {...this.methods} />
        }}
      </Consumer>
    );
  }
}

export default Wrapper;
