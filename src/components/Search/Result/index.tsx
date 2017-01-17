import { createElement, Component } from 'react';
import { observer } from 'mobx-react';
import { Author } from 'models';

@observer export default class Result extends Component<{ author: Author }, {}> {

  render() {
    return <div>
      {this.props.author.name}
    </div>;
  }

}
