import * as styles from './index.css';
import { createElement, Component, PropTypes, FormEvent } from 'react';
import { Style } from 'react-style';
import { observer } from 'mobx-react';
import { field } from 'scoopy';
import * as classNames from 'classnames';
import SearchController, { IMatchType } from './controller';
import Loading from '../Loading';
import Result from './Result';

@observer export default class Search extends Component<{ location }, {}> {

  static readonly contextTypes = {
    router: PropTypes.object.isRequired,
    jwt: PropTypes.string
  };

  @field readonly controller = new SearchController({
    ...this.context, ...this.props
  });

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
      <em>
        {results.length} van in totaal {results.size}{" "}
        {results.size === 1 ? "journalist" : "journalisten"}
        {" "}gevonden op zoekopdracht “{results.query}”:
      </em>
      <ul className="authors">
        {results.map(author =>
          <li key={author.id}>
            <Result author={author} includeArticles={this.controller.matchType === 'articles'} />
          </li>
        )}
      </ul>
    </div>;
  }

}
