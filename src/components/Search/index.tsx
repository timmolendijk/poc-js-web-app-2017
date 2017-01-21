import * as styles from './index.css';
import { createElement, Component, PropTypes, FormEvent } from 'react';
import { Style } from 'react-style';
import * as mobx from 'mobx';
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

  constructor(props) {
    Object.assign(this, props);
    mobx.autorun(() =>
      this.inputQuery = this.issuedQuery
    );
  }

  // TODO(tim): Define types as soon as they are available for React Router 4.
  @mobx.observable location;
  readonly router;

  @observable inputQuery: string = "";

  @mobx.computed get issuedQuery(): string {
    if (this.location.query && this.location.query.query)
      return this.location.query.query;
  }
  set issuedQuery(value: string) {
    this.router.replaceWith({
      query: { query: value }
    });
  }

  // TODO(tim): As soon as we support custom properties on array field values,
  // we can replace the following verbosity for a single observable `authors` of
  // type `Authors`.
  @observable private loadedAuthors: ReadonlyArray<Author>;
  @observable private authorCount: number;
  @observable private loadedQuery: string;
  @mobx.computed private get authors(): Authors {
    if (this.loadedAuthors == null)
      return;
    return Object.assign(this.loadedAuthors, {
      size: this.authorCount,
      query: this.loadedQuery
    });
  }
  private set authors(value: Authors) {
    this.loadedAuthors = value;
    this.authorCount = value.size;
    this.loadedQuery = value.query;
  }

  getAuthors() {
    if (this.issuedQuery && (!this.authors || this.authors.query !== this.issuedQuery))
      reportOnError(this.load());

    return this.authors;
  }

  @observable private pendingLoadCount: number = 0;

  @mobx.computed get isLoading() {
    return this.pendingLoadCount > 0;
  }

  @pending private async load() {
    // TODO(tim): This entire `try..catch` construct stems from the small
    // requirement of catching transport errors (and leaving others), without
    // losing typing on `result`. This should be less intrusive.
    try {

      // TODO(tim): This is a small and subtle requirement for getting lazy-
      // loading to work. How can we neatly and unobtrusively abstract this
      // away?
      await new Promise(setTimeout);

      this.pendingLoadCount++;

      const result = await Author.transport.list({ query: this.issuedQuery });

      if (result.params.query === this.inputQuery)
        this.authors = Object.assign(result, { query: result.params.query });

      this.pendingLoadCount--;

    } catch (err) {
      if (!isTransportError(err))
        throw err;
    }
  }
  
}

@observer export default class Search extends Component<{ location }, {}> {

  static readonly contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor(props, context) {
    super(props, context);
    this.controller = new SearchController({ ...context, ...props });
  }

  // TODO(tim): Since `controller` could be the only field necessary here, we
  // could delegate creating it to an HOC, and return with our view components
  // to stateless functional syntax.
  @field readonly controller;

  componentWillReceiveProps(props) {
    Object.assign(this.controller, props);
  }

  readonly onSubmitQuery = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.controller.issuedQuery = this.controller.inputQuery;
  };

  readonly onChangeQuery = (e: FormEvent<HTMLInputElement>) => {
    this.controller.inputQuery = e.currentTarget.value;
  };

  render() {
    return <div className="Search">
      <Style>{styles}</Style>
      <h1>Vind je?</h1>
      <form onSubmit={this.onSubmitQuery}>
        <input type="search" placeholder="Lekker zoeken kil!" autoFocus={true}
          value={this.controller.inputQuery} onChange={this.onChangeQuery} />
      </form>
      <div className="results">
        {this.renderResults()}
      </div>
    </div>;
  }

  renderResults() {
    if (this.controller.isLoading)
      return <Loading />;
    
    const authors = this.controller.getAuthors();

    if (!authors)
      return null;

    if (authors.size === 0)
      return <strong>niemand gevonden gap :(</strong>;
    
    return <div>
      <strong>
        {authors.length} van {authors.size}{" "}
        {authors.size === 1 ? "journalist" : "journalisten"}
        {" "}gevonden op zoekopdracht “{authors.query}”:
      </strong>
      <ul>
        {authors.map(author =>
          <li key={author.id}>
            <Result author={author} />
          </li>
        )}
      </ul>
    </div>;
  }

}
