import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Match, Miss } from 'react-router';
import * as Helmet from 'react-helmet';
import { ServerStyled } from 'style';

import Store from '../models/Store';
import Base from './Base';
import Page from './Page';
import Home from './Home';
import NotFound from './NotFound';

export default class DynamicBase extends React.Component<{ store: Store }, { }> {

  render() {
    return <Base store={this.props.store}>
      <Page>
        <Match exactly pattern="/" component={Home} />
        <Miss component={NotFound} />
      </Page>
    </Base>;
  }

  static renderToDocument(component, store: Store) {
    const renderedComponent = renderToStaticMarkup(
      <ServerStyled clientContainerId="root" serialize={true}>{component}</ServerStyled>
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
            __html: `window.__STORE__ = ${JSON.stringify(store.serialize())};`
          }} />
          <script src="http://localhost:3001/static/client.js" />
        </body>
      </html>
    );
  }

}
