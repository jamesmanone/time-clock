import * as shortid from 'shortid';

type Listener = (path:string)=>void;

export interface IRouter {
  subscribe: (fn:Listener)=>string;
  unsubscribe: (ident:string)=>void;
  navigate: (newPath:string)=>void;
}

export default class Router implements IRouter {
  private path: string;
  private listeners: { [key:string]:Listener } = {};

  constructor() {
    window.onpopstate = this.update;
    this.path = window.location.pathname;
  }

  navigate = (newPath: string) => {
    history.pushState({},'',newPath);
    this.update();
  }

  popstate = () => {
    this.update();
  }

  update = () => {
    this.path = window.location.pathname;
    Object.values(this.listeners).map(fn => fn(this.path));
  }

  subscribe = (fn: Listener):string => {
    const ident = shortid.generate();
    this.listeners[ident] = fn;
    fn(this.path);
    return ident;
  }

  unsubscribe = (ident:string): void => {
    delete this.listeners[ident];
  }
}
