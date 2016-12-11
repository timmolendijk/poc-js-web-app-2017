import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Match, Miss } from 'react-router';
import * as Helmet from 'react-helmet';
import DevTool from 'mobx-react-devtools';
import { ServerStyled } from 'style';

import State from '../models/State';
import Base from './Base';
import Page from './Page';
import Home from './Home';
import EventList from './EventList';
import NotFound from './NotFound';

export default class DynamicBase extends React.Component<{ state: State }, {}> {

  private renderDevTools() {
    if (process.env.NODE_ENV !== 'development')
      return null;
    
    return <DevTool />;
  }

  render() {
    return <Base state={this.props.state}>
      {this.renderDevTools()}
      <Page>
        <Match exactly pattern="/" component={Home} />
        <Match exactly pattern="/events" component={EventList} />
        <Miss component={NotFound} />
      </Page>
    </Base>;
  }

  static renderToDocument(component, state: State) {
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
            __html: `window.__STATE__ = ${JSON.stringify(state)};`
          }} />
          <script src="http://localhost:3001/static/client.js" />
        </body>
      </html>
    );
  }

}
