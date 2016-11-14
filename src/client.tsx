import * as React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router';
import { ClientStyled } from 'style';

import Store from './models/Store';
import DynamicBase from './components/DynamicBase';

const store = Store.deserialize((window as any).__STORE__);

render(
  <ClientStyled>
    <BrowserRouter>
      <DynamicBase store={store} />
    </BrowserRouter>
  </ClientStyled>,
  document.getElementById('root')
);
