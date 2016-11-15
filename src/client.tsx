import * as React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router';
import { ClientStyled } from 'style';

import { jsonp } from './models/Http';
import State from './models/State';
import DynamicBase from './components/DynamicBase';

const state = new State(jsonp, (window as any).__STATE__);

render(
  <ClientStyled>
    <BrowserRouter>
      <DynamicBase state={state} />
    </BrowserRouter>
  </ClientStyled>,
  document.getElementById('root')
);
