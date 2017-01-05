import * as styles from './index.css'
import * as React from 'react';
import { Link } from 'react-router';
import { observer } from 'mobx-react';
import { Style } from 'style';
import { inject } from 'state';
import Controller from './controller';

// TODO(tim): How do we formalize the fact that the resulting outer Component
// expects a `location` prop while the inner does not?
interface IProps {
  location?;
}

// TODO(tim): `location.query` should be passed on to view.
@inject({ controller: () => new Controller() }) @observer
export default class Search extends React.Component<IProps & { controller: Controller }, {}> {

  render() {
    return <div className="Search">
      <Style>{styles}</Style>
      <h3>Lekker zoeken</h3>
      <input type="search" autoFocus={true} placeholder="Search…"
        value={this.props.controller.query} 
        onChange={e => this.props.controller.query = e.currentTarget.value} />
      <Link to="/search?query=tim">zoek naar mijn maker</Link>
      {renderResults.call(this)}
    </div>;

    // TODO(tim): No class method because `inject` won't accept it for now.
    function renderResults() {
      if (this.props.controller.loading)
        return <p><strong>Loading</strong></p>;
      
      const authors = this.props.controller.getAuthors();

      if (!authors.length)
        return <p><em>no results</em></p>;
      
      return <div>
        <p>results—</p>
        <ul>
          {authors.map(author =>
            <li key={author.id}>{author.name}</li>
          )}
        </ul>
      </div>;
    }
  }
  
}
