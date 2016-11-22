import * as Koa from 'koa';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { useStaticRendering } from 'mobx-react';
import { ServerRouter, createServerRenderContext } from 'react-router';

import { server as serverTransport } from './models/Transport';
import State from './models/State';
import { BaseConstructor } from './components/Base';
import DynamicBase from './components/DynamicBase';
import AmpBase from './components/AmpBase';

useStaticRendering(true);

// Middleware for serving resources of a single type.
const renderOnMatch = (Base: BaseConstructor) => async function (context, next) {

  const state = new State(serverTransport);

  const renderContext = createServerRenderContext();

  const renderComponent =
    <ServerRouter location={context.url} context={renderContext}>
      <Base state={state} />
    </ServerRouter>;
  
  let html;
  let renderCount = 0;
  while (true) {
    renderCount++;
    html = Base.renderToDocument(renderComponent, state);
    const stable = state.stable;
    if (!(stable instanceof Promise))
      break;
    await stable;
  }

  const { redirect, missed } = renderContext.getResult();

  // TODO(tim): Report behavior only in development mode.
  let conclusion = "serve";
  if (redirect)
    conclusion = `redirect to ${redirect.pathname}`;
  else if (missed)
    conclusion = "no match";
  console.log(`${context.url} → ${Base.name} rendered ${renderCount} ✕ to reach stable state: ${conclusion}`);

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
