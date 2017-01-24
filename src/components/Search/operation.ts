import { debounce } from 'lodash';
import * as mobx from 'mobx';
import { pending } from 'scoopy';
import { observable } from 'scoopy-mobx';
import { reportOnError } from 'error';
import { isTransportError } from 'transport';
import { IVirtualArray, Author } from 'models';
import SearchController, { IMatchType } from './controller';

// TODO(tim): Why not just reuse `IAuthorListResult`?
interface IResults extends IVirtualArray<Author> {
  query: string;
}

export default class SearchOperation {

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
      (this.pendingQuery ?
        // Do nothing if issued query is currently being loaded, …
        this.controller.issuedQuery !== this.pendingQuery :
        // … or if no loads are pending, do nothing if results of issued query
        // are already loaded.
        (!this.results || this.controller.issuedQuery !== this.results.query));

    if (needsLoad)
      this.load();

    return this.results;
  }

  @observable error: string;

  @observable private pendingQuery: string;

  @mobx.computed get isLoading() {
    return Boolean(this.pendingQuery);
  }

  // TODO(tim): Are we sure that we don't want `@pending` here instead of on the
  // wrapped method?
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

      // The (edge-case) scenario of no pending query means that another query
      // was issued *after* ours but returned *before* us, making our results
      // no longer relevant.
      // TODO(tim): Comparing against `inputQuery` is not entirely safe as soon
      // as we start doing string preprocessing such as trimming whitespace.
      if (this.pendingQuery && list.params.query === this.controller.inputQuery)
        this.results = Object.assign([], list, { query: list.params.query });
      
    } catch (err) {

      if (!isTransportError(err))
        throw err;
      
      this.error = err.message;
      
    } finally {

      // Another load operation (using another query) may have been started
      // while this one was busy, so be careful not to reset the pending query
      // in that scenario.
      if (query === this.pendingQuery)
        this.pendingQuery = undefined;

    }
  }

}
