declare module "react-router" {

  import * as React from 'react';

  namespace ReactRouter {

    class BrowserRouter extends React.Component<any, {}> {}

    function createServerRenderContext();

    class ServerRouter extends React.Component<any, {}> {}

    class Match extends React.Component<any, {}> {}

    class Miss extends React.Component<any, {}> {}

  }

  export = ReactRouter;

}
