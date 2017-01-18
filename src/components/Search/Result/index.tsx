import * as styles from './index.css';
import { createElement, Component } from 'react';
import { Style } from 'react-style';
import { Link } from 'react-router';
import { observer } from 'mobx-react';
import { Author } from 'models';

@observer export default class Result extends Component<{ author: Author }, {}> {

  render() {
    return <div className="Search-Result">
      <Style>{styles}</Style>
      <Link to={this.props.author.profileUrl}>{this.props.author.name}</Link>
    </div>;
  }

}
