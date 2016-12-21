import * as React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router';
import { autorun } from 'mobx';
import { ClientStyled } from 'style';
import * as Mescy from 'mescy';
import DynamicBase from './components/DynamicBase';

const w = window as any;

let enhancer;

if (process.env.NODE_ENV === 'development') {
  // if (w.__REDUX_DEVTOOLS_EXTENSION__)
  //   enhancer = w.__REDUX_DEVTOOLS_EXTENSION__();
}

const state = new Mescy.Container(w.__STATE__/*, enhancer*/);

if (process.env.NODE_ENV === 'development') {
  w.__state__ = state;
  autorun(() => console.log('***', state.snapshot));
}

render(
  <ClientStyled>
    <BrowserRouter>
      <DynamicBase state={state} />
    </BrowserRouter>
  </ClientStyled>,
  document.getElementById('root')
);
