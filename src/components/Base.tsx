import * as styles from './Base.css';
import { createElement, Component, PropTypes } from 'react';
import { Store } from 'redux';
// TODO(tim): This is fragile.
import storeShape from 'react-redux/lib/utils/storeShape';
import { Style } from 'react-style';

interface IProps {
  store: Store<any>;
  jwt?: string;
  children?: any;
}

export interface IBaseConstructor {
  new (props: IProps): Component<IProps, {}>;
  renderToMarkup(component, state): string;
}

// TODO(tim): Naming here is confusing. One would expect that classes like
// `DynamicBase` inherit from this one, but that is not the case.
export default class Base extends Component<IProps, {}> {

  static readonly childContextTypes = {
    store: storeShape,
    jwt: PropTypes.string
  };

  getChildContext() {
    return {
      store: this.props.store,
      jwt: this.props.jwt
    };
  }

  render() {
    return <div>
      <Style>{styles}</Style>
      {this.props.children}
    </div>;
  }

}
