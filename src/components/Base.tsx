import * as styles from './Base.css';
import * as React from 'react';
import { Style } from 'style';
import { Container, Provider } from 'state';

interface IProps {
  state: Container;
  children?: any;
}

export interface IBaseConstructor {
  new (props: IProps): React.Component<IProps, {}>;
  renderToMarkup(component, state): string;
}

export default function Base({ state, children }: IProps) {

  return <div>
    <Style>{styles}</Style>
    <Provider state={state}>
      {children}
    </Provider>
  </div>;
}
