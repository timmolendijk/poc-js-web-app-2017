Proof of concept for universal JavaScript web application that elegantly combines the following features:

* written in TypeScript;
* generates ES6 JavaScript bundles via webpack;
* view layer implemented based on React;
* routing based on React Router v4;
* server-side renderer supports generating various page types depending on route match;
* server-side renderer will automagically await pending data requests;
* supports state management using MobX;
* client-side view rendering can take over where server-side rendering left off (application state can be persisted from server to client);
* can render valid Accelerated Mobile Pages;
* enables writing modular component-based styling;
* can render style sheets at run-time based on current view.
