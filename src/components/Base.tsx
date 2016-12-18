import * as styles from './Base.css';
import * as React from 'react';
import { Style } from 'style';
import { State, IStores, ProvideState } from 'state'
import { Normalizer } from 'normalize';

declare module 'state' {
  interface IStores {
    normalizer?: Normalizer;
  }
}

interface IProps {
  state: State;
  children?: any;
}

export interface IBaseConstructor {
  new (props: IProps): React.Component<IProps, {}>;
  renderToDocument(component, state): string;
}

export default function Base({ state, children }: IProps) {

  // May look dubious to do this upon every render, but as far as I can see in
  // practice this is just fine because this component will render exactly once
  // per instantiation.
  state.addStore('normalizer', data => new Normalizer(data));

  return <div>
    <Style>{styles}</Style>
    <ProvideState state={state}>
      <div>{children}</div>
    </ProvideState>
  </div>;
}
