import * as Koa from 'koa';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { ServerRouter, createServerRenderContext } from 'react-router';
import * as Helmet from 'react-helmet';
import { Styled } from 'style';

import Store from './models/Store';
import { BaseConstructor } from './components/Base';
import DynamicBase from './components/DynamicBase';
import AmpBase from './components/AmpBase';


// Middleware for serving resources of a single type.
const renderOnMatch = (Base: BaseConstructor) => async function (context, next) {

  const store = new Store(context.request);

  const renderContext = createServerRenderContext();

  const renderComponent =
    <ServerRouter location={context.url} context={renderContext}>
      <Base store={store} />
    </ServerRouter>;

  // Pre-render to initiate all (asynchronous) prerequisites.
  // TODO(tim): Use `renderToStaticMarkup` instead?
  renderToString(<Styled>{renderComponent}</Styled>);
  Helmet.rewind();

  await store.loading;

  // TODO(tim): State updates may trigger additional requirements, so to cover
  // all scenarios we need to iterate until `view` stabilizes.

  // Retrieve a presentable view by rendering again based on fully loaded state.
  // TODO(tim): This can be optimized in the sense that in many scenarios no
  // asynchronous prefetching is done.
  const html = Base.renderToDocument(renderComponent, store);

  const { redirect, missed } = renderContext.getResult();

  if (redirect)
    return context.redirect(redirect.pathname);

  if (!missed)
    return context.body = html;
  
  await next();

  if (context.status !== 404 || context.body)
    return;

  // Explicitly set status because current value may be the default, which would
  // then be overridden by the body assignment.
  context.status = 404;
  context.body = html;

};


const server = new Koa();

server.use(async function (context, next) {
  const startTime = Date.now();
  await next();
  context.set('X-Response-Time', String(Date.now() - startTime));
});

server.use(renderOnMatch(AmpBase));

server.use(renderOnMatch(DynamicBase));

server.listen(3000, 'localhost', function (err, result) {
  if (err) {
    console.error(err);
  }

  console.log('Server listening at localhost:3000');
});
