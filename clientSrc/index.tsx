import * as React from 'react';
import * as reactDOM from 'react-dom';

import { Provider } from './state';
import Model from './Model/index';
import Router from './Router/Router';
import { BrowserRouter } from './Router/index';

import App from './components/App';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import 'style.css';

reactDOM.render((
  <Provider value={new Model()}>
    <BrowserRouter value={new Router()}>
      <App />
    </BrowserRouter>
  </Provider>
), document.getElementById('app')!);
