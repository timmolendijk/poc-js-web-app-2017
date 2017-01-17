import * as styles from './index.css';
import { createElement, Component, FormEvent } from 'react';
import { Style } from 'react-style';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { IIdentifier, field, pending } from 'scoopy';
import { observable } from 'scoopy-mobx';
import { reportOnError } from 'error';
import { isTransportError } from 'transport';
import { Author } from 'models';
import Loading from '../Loading';
import Result from './Result';

@observer export default class Search extends Component<{}, {}> {

  @observable private query: string = "";

  // TODO(tim): We could introduce an interface to represent this "virtual list"
  // kind of concept.
  @observable private authors: ReadonlyArray<Author>;
  @observable private authorCount: number;

  @observable private pendingLoadCount = 0;

  @computed private get isLoading() {
    return this.pendingLoadCount > 0;
  }

  @pending private async load() {
    // TODO(tim): Side-effect mutations cannot be performed synchronously
    // because it would result in a re-render being ordered while current render
    // has not yet ended. One may argue that triggering side-effects from a
    // render is an anti-pattern, but I cannot see how lazy-loading can be
    // implemented otherwise and I do not consider lazy-loading server-fetched
    // data an anti-pattern in itself.
    setTimeout(() => this.pendingLoadCount++);

    try {

      const result = await Author.transport.list({ query: this.query });

      // TODO(tim): How do we guarantee response order integrity? Include the
      // request query on the response?      
      this.authors = result.slice();
      this.authorCount = result.size;
      this.pendingLoadCount--;

    } catch (err) {
      if (!isTransportError(err))
        throw err;
    }
  }

  private readonly onSubmitQuery = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    reportOnError(this.load());
  };

  private readonly onChangeQuery = (e: FormEvent<HTMLInputElement>) => {
    this.query = e.currentTarget.value;
  };

  render() {
    return <div className="Search">
      <Style>{styles}</Style>
      <h1>Vind je?</h1>
      <form onSubmit={this.onSubmitQuery}>
        <input type="search" value={this.query} onChange={this.onChangeQuery}
          placeholder="Lekker zoeken kil!" />
      </form>
      <div>
        {this.renderResults()}
      </div>
    </div>;
  }

  private renderResults() {
    if (this.isLoading)
      return <Loading />;
    
    if (this.authors == null)
      return null;
    
    if (this.authorCount === 0)
      return <strong>niemand gevonden gap :(</strong>;
    
    return <div>
      <strong>
        {this.authors.length} van {this.authorCount} gevonden{" "}
        {this.authorCount === 1 ? "journalist" : "journalisten"}
      </strong>
      <ul>
        {(this.authors || []).map(author =>
          <li key={author.id}><Result author={author} /></li>
        )}
      </ul>
    </div>;
  }

}