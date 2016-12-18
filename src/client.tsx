import * as React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router';
import { ClientStyled } from 'style';
import { State } from 'state';
import DynamicBase from './components/DynamicBase';

const state = new State((window as any).__STATE__);

if (process.env.NODE_ENV === 'development') {

  const w: any = window;

  // TODO(tim): Replace with a more powerful debugging tool such as writing an
  // adapter for the Redux dev tool.
  console.info("Your application state is accessible at `window.__state__`. Happy developing!");
  w.__state__ = state;

}

render(
  <ClientStyled>
    <BrowserRouter>
      <DynamicBase state={state} />
    </BrowserRouter>
  </ClientStyled>,
  document.getElementById('root')
);
