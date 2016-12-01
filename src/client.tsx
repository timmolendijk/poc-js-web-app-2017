import * as React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router';
import { ClientStyled } from 'style';

import State from './models/State';
import DynamicBase from './components/DynamicBase';

const state = new State((window as any).__STATE__);

// TODO(tim): Replace with a more powerful debugging tool such as writing an
// adapter for the Redux dev tool.
if (process.env.NODE_ENV === 'development')
  (window as any).__state__ = state;

render(
  <ClientStyled>
    <BrowserRouter>
      <DynamicBase state={state} />
    </BrowserRouter>
  </ClientStyled>,
  document.getElementById('root')
);
