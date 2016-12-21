import * as styles from './Base.css';
import * as React from 'react';
import { Style } from 'style';
import * as Mescy from 'mescy';

interface IProps {
  state: Mescy.Container;
  children?: any;
}

export interface IBaseConstructor {
  new (props: IProps): React.Component<IProps, {}>;
  renderToMarkup(component, state): string;
}

export default function Base({ state, children }: IProps) {

  return <div>
    <Style>{styles}</Style>
    <Mescy.Provider state={state}>
      <div>{children}</div>
    </Mescy.Provider>
  </div>;
}
