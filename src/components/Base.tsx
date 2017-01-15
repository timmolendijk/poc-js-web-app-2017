import * as styles from './Base.css';
import { createElement, Component } from 'react';
import { Store } from 'redux';
import { Provider } from 'react-redux';
import { Style } from 'react-style';

interface IProps {
  store: Store<any>;
  children?: any;
}

export interface IBaseConstructor {
  new (props: IProps): Component<IProps, {}>;
  renderToMarkup(component, state): string;
}

export default function Base({ store, children }: IProps) {

  return <div>
    <Style>{styles}</Style>
    <Provider store={store}>
      <div>{children}</div>
    </Provider>
  </div>;
}
