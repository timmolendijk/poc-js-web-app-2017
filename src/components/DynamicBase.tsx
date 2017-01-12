import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Match, Miss } from 'react-router';
import * as Helmet from 'react-helmet';
import { Store } from 'redux';
import DevTool from 'mobx-react-devtools';
import { ServerStyled } from 'style';
import Base from './Base';
import Page from './Page';
// import EventList from './EventList';
// import Search from './Search';
import ScoopyTest from './ScoopyTest';
import NotFound from './NotFound';

export default class DynamicBase extends React.Component<{ store: Store<any> }, {}> {

  private renderDevTools() {
    if (process.env.NODE_ENV != 'development')
      return null;
    
    return <DevTool />;
  }

  render() {
    return <Base store={this.props.store}>
      {this.renderDevTools()}
      <Page>
        {/*<Match exactly pattern="/events" component={EventList} />
        <Match exactly pattern="/search" component={Search} />*/}
        <Match exactly pattern="/scoopy" component={ScoopyTest} />
        <Miss component={NotFound} />
      </Page>
    </Base>;
  }

  static renderToMarkup(component, store: Store<any>) {
    const renderedComponent = renderToStaticMarkup(
      <ServerStyled clientContainerId="root" serialize={true}>
        {component}
      </ServerStyled>
    );
    const { title, link, style } = Helmet.rewind();

    return "<!doctype html>\n" + renderToStaticMarkup(
      <html>
        <head>
          {title.toComponent()}
          {link.toComponent()}
          {style.toComponent()}
        </head>
        <body>
          <div dangerouslySetInnerHTML={{ __html: renderedComponent }} />
          <script dangerouslySetInnerHTML={{
            __html: `window.__STORE__ = ${JSON.stringify(store.getState())};`
          }} />
          <script src="http://localhost:3001/static/client.js" />
        </body>
      </html>
    );
  }

}
