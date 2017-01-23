import { debounce } from 'lodash';
import * as mobx from 'mobx';
import { field } from 'scoopy';
import { observable } from 'scoopy-mobx';
import SearchOperation from './operation';

export type IMatchType = 'authors' | 'articles';

const DEFAULT_MATCH_TYPE: IMatchType = 'authors';

export default class SearchController {

  constructor(props) {
    Object.assign(this, props);
    this.inputQuery = this.issuedQuery || "";
  }

  readonly jwt: string;
  // TODO(tim): Define types as soon as they are available for React Router 4.
  readonly router;
  @mobx.observable.ref location;

  @observable inputQuery: string;

  @mobx.computed get issuedQuery(): string {
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
