import * as React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router';
import { ClientStyled } from 'style';

import { client as clientTransport } from './models/Transport';
import State from './models/State';
import DynamicBase from './components/DynamicBase';

const state = new State(clientTransport, (window as any).__STATE__);

state.allowResumeLoad = true;

render(
  <ClientStyled>
    <BrowserRouter>
      <DynamicBase state={state} />
    </BrowserRouter>
  </ClientStyled>,
  document.getElementById('root')
);
