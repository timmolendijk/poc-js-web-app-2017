import * as Koa from 'koa';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { ServerRouter, createServerRenderContext } from 'react-router';
import { useStaticRendering } from 'mobx-react';
import { createStore } from 'redux';
import { storeEnhancer, resetNextId, getPending } from 'scoopy';
import { IBaseConstructor } from './components/Base';
import DynamicBase from './components/DynamicBase';
import AmpBase from './components/AmpBase';

useStaticRendering(true);

// Middleware for serving resources of a single type.
const renderOnMatch = (Base: IBaseConstructor) => async function (context, next) {

  const store = createStore(state => state || {}, storeEnhancer);

  const renderContext = createServerRenderContext();

  const renderComponent =
    <ServerRouter location={context.url} context={renderContext}>
      <Base store={store} />
    </ServerRouter>;
  
  let html;
  let renderCount = 0;
  while (true) {
    renderCount++;
    resetNextId(store);
    html = Base.renderToMarkup(renderComponent, store);
    const pending = getPending(store);
    if (!(pending instanceof Promise))
      break;
    await pending;
  }

  const { redirect, missed } = renderContext.getResult();

  if (process.env.NODE_ENV == 'development') {
    let conclusion = "serve";
    if (redirect)
      conclusion = `redirect to ${redirect.pathname}`;
    else if (missed)
      conclusion = "no match";
    console.log(`${context.url} → ${Base.name} rendered ${renderCount} ✕ to reach stable state: ${conclusion}`);
  }

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

  if (process.env.NODE_ENV == 'development')
    console.log('Server listening at localhost:3000');
});
