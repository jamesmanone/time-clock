import * as React from 'react';

export interface Props {
  children: any;
  to: string;
  path: string;
  navigate: (to:any)=>void;
}

const getClassName = (path: string, to: string): string =>
  path == to ? 'nav-item active' : 'nav-item';

const NavLink = (props: Props) => (
  <li className={getClassName(props.path, props.to)}>
    <a href={props.to} className="nav-link" onClick={props.navigate}>
      {props.children}
    </a>
  </li>
);

export default NavLink;
