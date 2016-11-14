import * as styles from './base.css';

import * as React from 'react';
import { Provider } from 'mobx-react';
import { Style } from 'style';

import Store from '../models/Store';

interface Props {
  store: Store,
  children?: any
}

export interface BaseConstructor {
  new (props: Props): React.Component<Props, { }>;
  renderToDocument(component, store): string;
}

export default function Base({ store, children }: Props) {
  return <div>
    <Style>{styles}</Style>
    <Provider store={store}>{children}</Provider>
  </div>;
}
