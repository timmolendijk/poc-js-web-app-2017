import * as styles from './index.css';
import { createElement, Component, FormEvent } from 'react';
import { Style } from 'react-style';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { IIdentifier, field, pending } from 'scoopy';
import { observable } from 'scoopy-mobx';
import { reportOnError } from 'error';
import { isTransportError } from 'transport';
import { ICollection, Author } from 'models';
import Loading from '../Loading';
import Result from './Result';

@observer export default class Search extends Component<{}, {}> {

  @observable private query: string = "";

  // TODO(tim): As soon as we support custom properties on array field values,
  // we can replace the following verbosity for a single observable `authors` of
  // type `ICollection<Author>`.
  @observable private loadedAuthors: ReadonlyArray<Author>;
  @observable private authorCount: number;
  @computed private get authors(): ICollection<Author> {
    if (this.loadedAuthors == null)
      return;
    return Object.assign(this.loadedAuthors, {
      size: this.authorCount
    });
  }
  private set authors(value: ICollection<Author>) {
    this.loadedAuthors = value;
    this.authorCount = value.size;
  }

  @observable private pendingLoads: ReadonlyArray<string> = [];

  @computed private get isLoading() {
    return this.pendingLoads.length > 0;
  }

  @pending private async load() {
    try {

      this.pendingLoads = [...this.pendingLoads, this.query];

      const result = await Author.transport.list({ query: this.query });

      if (result.params.query == this.pendingLoads[this.pendingLoads.length - 1])
        this.authors = result;
      
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
        {this.authors.map(author =>
          <li key={author.id}><Result author={author} /></li>
        )}
      </ul>
    </div>;
  }

}
