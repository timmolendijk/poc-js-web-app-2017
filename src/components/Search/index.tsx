import * as styles from './index.css';
import { createElement, Component, PropTypes, FormEvent } from 'react';
import { Style } from 'react-style';
import * as mobx from 'mobx';
import { observer } from 'mobx-react';
import { field, pending } from 'scoopy';
import { observable } from 'scoopy-mobx';
import { reportOnError } from 'error';
import { isTransportError } from 'transport';
import { IVirtualArray, Author } from 'models';
import * as classNames from 'classnames';
import { debounce } from 'lodash';
import Loading from '../Loading';
import Result from './Result';

interface IResults extends IVirtualArray<Author> {
  query: string;
}

type IMatchType = 'authors' | 'articles';

const DEFAULT_MATCH_TYPE: IMatchType = 'authors';

class SearchOperation {

  constructor(private readonly controller: SearchController, private readonly matchType: IMatchType) {}

  get id() {
    return this.matchType;
  }

  // TODO(tim): As soon as we support custom properties on array field values,
  // we can replace the following verbosity for a single observable `results` of
  // type `IResults`.
  @observable private resultsLoaded: ReadonlyArray<Author>;
  @observable private resultsSize: number;
  @observable private resultsQuery: string;
  @mobx.computed private get results(): IResults {
    if (this.resultsLoaded == null)
      return;
    return Object.assign([], this.resultsLoaded, {
      size: this.resultsSize,
      query: this.resultsQuery
    });
  }
  private set results(value: IResults) {
    if (value == null) {
      this.resultsLoaded = undefined;
      this.resultsSize = undefined;
      this.resultsQuery = undefined;
    } else {
      this.resultsLoaded = value.slice();
      this.resultsSize = value.size;
      this.resultsQuery = value.query;
    }
  }

  getResults() {
    // TODO(tim): Wow, does this really have to be so complicated??
    const needsLoad: boolean =
      // Never lazy-load data when we are in an error state to prevent ending up
      // in an infinite loop.
      !this.error &&
      // Ignore empty queries unless we have some results to reset.
      (this.controller.issuedQuery || this.results) &&
      this.pendingQuery ?
        // Do nothing if issued query is currently being loaded, …
        this.controller.issuedQuery !== this.pendingQuery :
        // … or if no loads are pending, do nothing if results of issued query
        // are already loaded.
        (!this.results || this.controller.issuedQuery !== this.results.query);
    
    if (needsLoad)
      this.load();

    return this.results;
  }

  @observable error: string;

  @observable private pendingQuery: string;

  @mobx.computed get isLoading() {
    return Boolean(this.pendingQuery);
  }

  private readonly load = debounce(
    () => reportOnError(this.dangerouslyLoadWithoutDebounce()),
    300,
    { leading: true, trailing: false }
  );

  // TODO(tim): As soon as `pending` would support wrapping a function directly,
  // we could include the leading debounce here and get rid of this stupid name.
  @pending private async dangerouslyLoadWithoutDebounce() {
    // TODO(tim): This is a small and subtle requirement for getting lazy-
    // loading to work. How can we neatly and unobtrusively abstract this
    // away?
    await new Promise(setTimeout);

    const query = this.controller.issuedQuery;

    this.error = undefined;

    if (!query) {
      this.results = undefined;
      return;
    }

    // TODO(tim): This entire `try..catch` construct stems from the small
    // requirement of catching transport errors (and leaving others), without
    // losing typing on `result`. This should be less intrusive.
    try {

      this.pendingQuery = query;

      const list = await Author.transport.list({
        query, match: this.matchType
      }, this.controller.jwt);

      // TODO(tim): Comparing against `inputQuery` is not entirely safe as soon
      // as we start doing string preprocessing such as trimming whitespace.
      if (list.params.query === this.controller.inputQuery)
        // TODO(tim): Better not mutate `list`.
        this.results = Object.assign(list, { query: list.params.query });
      
    } catch (err) {

      if (!isTransportError(err))
        throw err;
      
      this.error = err.message;
      
    } finally {

      // Another load operation (using another query) may have been started
      // while this one was waiting, so be careful not to reset the pending
      // query in that scenario.
      if (query === this.pendingQuery)
        this.pendingQuery = undefined;

    }
  }

}

class SearchController {

  constructor(props) {
    Object.assign(this, props);
    this.inputQuery = this.issuedQuery || "";
  }

  readonly jwt: string;
  // TODO(tim): Define types as soon as they are available for React Router 4.
  readonly router;
  @mobx.observable.ref location;

  @observable inputQuery: string;

  get issuedQuery(): string {
    if (this.location.query && this.location.query.query)
      return this.location.query.query;
  }

  readonly issueQuery = debounce(
    () => this.router.replaceWith({
      query: {
        ...this.location.query,
        query: this.inputQuery || undefined
      }
    }),
    300,
    { leading: false, trailing: true }
  );

  @mobx.computed get matchType(): IMatchType {
    if (this.location.query && this.location.query.match)
      return this.location.query.match;
    return DEFAULT_MATCH_TYPE;
  }
  set matchType(value: IMatchType) {
    this.router.replaceWith({
      query: {
        ...this.location.query,
        match: value !== DEFAULT_MATCH_TYPE ? value : undefined
      }
    });
  }

  @field private readonly authorsSearch = new SearchOperation(this, 'authors');
  @field private readonly articlesSearch = new SearchOperation(this, 'articles');

  getSearch(matchType: IMatchType = this.matchType): SearchOperation {
    return this[`${matchType}Search`];
  }

}

@observer export default class Search extends Component<{ location }, {}> {

  static readonly contextTypes = {
    router: PropTypes.object.isRequired,
    jwt: PropTypes.string
  };

  constructor(props, context) {
    super(props, context);
    this.controller = new SearchController({ ...context, ...props });
  }

  // TODO(tim): Since `controller` could be the only field necessary here, we
  // could delegate creating it to an HOC, and return with our view components
  // to stateless functional syntax.
  @field readonly controller: SearchController;

  componentWillReceiveProps(props) {
    Object.assign(this.controller, props);
  }

  readonly onSubmitQuery = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.controller.issueQuery.flush();
  };

  readonly onChangeQuery = (e: FormEvent<HTMLInputElement>) => {
    this.controller.inputQuery = e.currentTarget.value;
    this.controller.issueQuery();
  };

  render() {
    return <div className="Search">
      <Style>{styles}</Style>
      <h1>Zoekings</h1>
      <form onSubmit={this.onSubmitQuery}>
        {this.renderMatchType('authors', "op naam")}
        {this.renderMatchType('articles', "op inhoud")}
        <input type="search" placeholder="Tiep dan kil…" autoFocus={true}
          value={this.controller.inputQuery} onChange={this.onChangeQuery} />
      </form>
      <div className="results">
        {this.renderResults()}
      </div>
    </div>;
  }

  readonly onChangeMatchType = (e: FormEvent<HTMLInputElement>) => {
    this.controller.matchType = e.currentTarget.value as IMatchType;
  };

  renderMatchType(matchType: IMatchType, label: string) {
    const isSelected = this.controller.matchType === matchType;
    const results = this.controller.getSearch(matchType).getResults();

    let count = null;
    if (results)
      count = <span>({results.size})</span>;

    return <label className={classNames('matchType', { isSelected })}>
      <input type="radio" name="matchType" value={matchType} checked={isSelected}
        onChange={this.onChangeMatchType} /> {label} {count}
    </label>;
  }

  renderResults() {
    const search = this.controller.getSearch();

    if (search.isLoading)
      return <Loading />;
    
    if (search.error)
      return <strong>whoopsie! <pre>{search.error}</pre></strong>;
    
    const results = search.getResults();

    if (!results)
      return null;

    if (results.size === 0)
      return <strong>niemand gevonden gap :(</strong>;
    
    return <div>
      <strong>
        {results.length} van {results.size}{" "}
        {results.size === 1 ? "journalist" : "journalisten"}
        {" "}gevonden op zoekopdracht “{results.query}”:
      </strong>
      <ul>
        {results.map(author =>
          <li key={author.id}>
            <Result author={author} />
          </li>
        )}
      </ul>
    </div>;
  }

}
