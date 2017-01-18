import * as styles from './index.css';
import { createElement, Component, FormEvent } from 'react';
import { Style } from 'react-style';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { IIdentifier, field, pending } from 'scoopy';
import { observable } from 'scoopy-mobx';
import { reportOnError } from 'error';
import { isTransportError } from 'transport';
import { IVirtualArray, Author } from 'models';
import Loading from '../Loading';
import Result from './Result';

interface Authors extends IVirtualArray<Author> {
  query: string;
}

class SearchController {

  @observable query: string = "";

  // TODO(tim): As soon as we support custom properties on array field values,
  // we can replace the following verbosity for a single observable `authors` of
  // type `Authors`.
  @observable private loadedAuthors: ReadonlyArray<Author>;
  @observable private authorCount: number;
  @observable private loadedQuery: string;
  @computed get authors(): Authors {
    if (this.loadedAuthors == null)
      return;
    return Object.assign(this.loadedAuthors, {
      size: this.authorCount,
      query: this.loadedQuery
    });
  }
  set authors(value: Authors) {
    this.loadedAuthors = value;
    this.authorCount = value.size;
    this.loadedQuery = value.query;
  }

  @observable private pendingLoads: ReadonlyArray<string> = [];

  @computed get isLoading() {
    return this.pendingLoads.length > 0;
  }

  @pending async load() {
    // TODO(tim): This entire `try..catch` construct stems from the small
    // requirement of catching transport errors (and leaving others), without
    // losing typing on `result`. This should be less intrusive.
    try {

      this.pendingLoads = [...this.pendingLoads, this.query];

      const result = await Author.transport.list({ query: this.query });

      if (result.params.query === this.pendingLoads[this.pendingLoads.length - 1])
        this.authors = Object.assign(result, { query: result.params.query });
      
      // Making sure to unlist the *first* occurence of the query that resulted
      // in `result`, because FIFO.
      const pendingIndex = this.pendingLoads.indexOf(result.params.query);
      this.pendingLoads = [
        ...this.pendingLoads.slice(0, pendingIndex),
        ...this.pendingLoads.slice(pendingIndex + 1)
      ];

    } catch (err) {
      if (!isTransportError(err))
        throw err;
    }
  }
  
}

@observer export default class Search extends Component<{}, {}> {

  @field private readonly controller = new SearchController();

  private readonly onSubmitQuery = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    reportOnError(this.controller.load());
  };

  private readonly onChangeQuery = (e: FormEvent<HTMLInputElement>) => {
    this.controller.query = e.currentTarget.value;
  };

  render() {
    return <div className="Search">
      <Style>{styles}</Style>
      <h1>Vind je?</h1>
      <form onSubmit={this.onSubmitQuery}>
        <input type="search" value={this.controller.query} onChange={this.onChangeQuery}
          placeholder="Lekker zoeken kil!" />
      </form>
      <div className="results">
        {this.renderResults()}
      </div>
    </div>;
  }

  private renderResults() {
    if (this.controller.isLoading)
      return <Loading />;
    
    if (this.controller.authors == null)
      return null;
    
    if (this.controller.authors.size === 0)
      return <strong>niemand gevonden gap :(</strong>;
    
    return <div>
      <strong>
        {this.controller.authors.length} van {this.controller.authors.size}{" "}
        {this.controller.authors.size === 1 ? "journalist" : "journalisten"}
        {" "}gevonden op zoekopdracht “{this.controller.authors.query}”:
      </strong>
      <ul>
        {this.controller.authors.map(author =>
          <li key={author.id}>
            <Result author={author} />
          </li>
        )}
      </ul>
    </div>;
  }

}
