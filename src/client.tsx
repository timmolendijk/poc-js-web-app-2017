import * as React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router';
import { compose, createStore } from 'redux';
import { Container } from 'state';
import { ClientStyled } from 'style';
import DynamicBase from './components/DynamicBase';

const w = window as any;

const state = new Container();

let enhancer = state.enhancer;

if (process.env.NODE_ENV === 'development') {
  if (w.__REDUX_DEVTOOLS_EXTENSION__)
    enhancer = compose(enhancer, w.__REDUX_DEVTOOLS_EXTENSION__());
}

createStore(state => state || {}, w.__STATE__, enhancer);

render(
  <ClientStyled>
    <BrowserRouter>
      <DynamicBase state={state} />
    </BrowserRouter>
  </ClientStyled>,
  document.getElementById('root')
);
