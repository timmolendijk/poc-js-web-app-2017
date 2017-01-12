import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Match, Miss } from 'react-router';
import * as Helmet from 'react-helmet';
import { Store } from 'redux';
import { ServerStyled } from 'style';
import Base from './Base';
import Page from './Page';
import Event from './Event';
import NotFound from './NotFound';

export default class AmpBase extends React.Component<{ store: Store<any> }, {}> {

  render() {
    const ampStandardLib = {
      async: undefined,
      src: "https://cdn.ampproject.org/v0.js"
    };

    return <Base store={this.props.store}>
      <Page>
        <Helmet script={[ampStandardLib]} />
        <Match pattern="/event" component={Event} />
        <Miss component={NotFound} />
      </Page>
    </Base>;
  }

  static renderToMarkup(component, store?: Store<any>) {
    const renderedComponent = renderToStaticMarkup(
      <ServerStyled singleton={{ 'amp-custom': undefined }}>
        {component}
      </ServerStyled>
    );
    const { title, link, style, script } = Helmet.rewind();

    return `<!doctype html>
<html amp lang="en">
  <head>
    <meta charset="utf-8">
    ${script}
    ${title}
    ${link}
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <script type="application/ld+json">
      {
        "@context": "http://schema.org",
        "@type": "NewsArticle",
        "headline": "Open-source framework for publishing content",
        "datePublished": "2015-10-07T12:02:41Z",
        "image": [
          "logo.jpg"
        ]
      }
    </script>
    <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
    ${style}
  </head>
  <body>
    ${renderedComponent.replace(/\sis="true"/g, "")}
  </body>
</html>`;
  }

}
