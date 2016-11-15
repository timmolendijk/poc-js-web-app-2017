import * as styles from './Base.css';

import * as React from 'react';
import { Provider } from 'mobx-react';
import { Style } from 'style';

import State from '../models/State';

interface Props {
  state: State,
  children?: any
}

export interface BaseConstructor {
  new (props: Props): React.Component<Props, { }>;
  renderToDocument(component, state): string;
}

export default function Base({ state, children }: Props) {
  return <div>
    <Style>{styles}</Style>
    <Provider state={state}>{children}</Provider>
  </div>;
}
