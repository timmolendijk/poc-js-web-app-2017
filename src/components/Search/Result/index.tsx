import * as styles from './index.css';
import { createElement, Component } from 'react';
import { Style } from 'react-style';
import { Link } from 'react-router';
import { observer } from 'mobx-react';
import { Author } from 'models';

@observer export default class Result extends Component<{ author: Author, includeArticles?: boolean }, {}> {

  render() {
    return <div className="Search-Result">
      <Style>{styles}</Style>
      <Link to={this.props.author.profileUrl} className="authorName">{this.props.author.name}</Link>
      {this.renderArticles()}
    </div>;
  }

  renderArticles() {
    if (this.props.includeArticles !== true)
      return null;
    
    const articles = this.props.author.getArticles();

    if (!articles)
      return null;

    return <div>
      <p>{articles.size} relevante artikelen:</p>
      <ul>
        {articles.map(article =>
          <li key={article.id}>{article.title}</li>
        )}
      </ul>
    </div>;
  }

}
