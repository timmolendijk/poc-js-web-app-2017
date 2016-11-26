import * as styles from './Base.css';

import * as React from 'react';
import { Provider } from 'mobx-react';
import { Style } from 'style';

import { State, Stores } from '../models/State'
import { ModelRegistry } from '../models/Model';

declare module '../models/State' {
  interface Stores {
    models?: ModelRegistry;
  }
}

interface Props {
  state: State,
  children?: any
}

export interface BaseConstructor {
  new (props: Props): React.Component<Props, { }>;
  renderToDocument(component, state): string;
}

export default function Base({ state, children }: Props) {

  // May look dubious to do this upon every render, but as far as I can see in
  // practice this is just fine because this component will render exactly once
  // per instantiation.
  state.stores.add('models', data => new ModelRegistry(data));

  return <div>
    <Style>{styles}</Style>
    <Provider stores={state.stores}>{children}</Provider>
  </div>;
}
