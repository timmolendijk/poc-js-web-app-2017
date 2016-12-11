import * as React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router';
import { ClientStyled } from 'style';

import State from 'State';
import DynamicBase from './components/DynamicBase';

const state = new State((window as any).__STATE__);

// TODO(tim): Replace with a more powerful debugging tool such as writing an
// adapter for the Redux dev tool.
if (process.env.NODE_ENV === 'development') {
  console.info("Your application state is accessible at `window.__state__`. Happy developing!");
  (window as any).__state__ = state;
}

render(
  <ClientStyled>
    <BrowserRouter>
      <DynamicBase state={state} />
    </BrowserRouter>
  </ClientStyled>,
  document.getElementById('root')
);
