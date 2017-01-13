import * as React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router';
import { compose, createStore } from 'redux';
import { ClientStyled } from 'style';
import { reducer } from 'scoopy/store';
import DynamicBase from './components/DynamicBase';

const w = window as any;

let enhancer;

if (process.env.NODE_ENV == 'development') {
  if (w.__REDUX_DEVTOOLS_EXTENSION__)
    enhancer = w.__REDUX_DEVTOOLS_EXTENSION__();
    // enhancer = compose(enhancer, w.__REDUX_DEVTOOLS_EXTENSION__());
}

const store = createStore(reducer/*, w.__STORE__*/, enhancer);

render(
  <ClientStyled>
    <BrowserRouter>
      <DynamicBase store={store} />
    </BrowserRouter>
  </ClientStyled>,
  document.getElementById('root')
);
