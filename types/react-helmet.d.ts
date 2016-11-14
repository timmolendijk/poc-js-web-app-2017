// Type definitions for react-helmet
// Project: https://github.com/nfl/react-helmet
// Definitions by: Evan Bremer <https://github.com/evanbb>,
//   Isman Usoh <https://github.com/isman-usoh>,
//   Tim Molendijk <https://github.com/timmolendijk>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

// import * as React from "react";

declare module "react-helmet" {

  namespace ReactHelmet {

    interface HelmetProps {
      base?: any;
      defaultTitle?: string;
      htmlAttributes?: any;
      link?: Array<any>;
      meta?: Array<any>;
      script?: Array<any>;
      style?: Array<any>;
      title?: string;
      titleTemplate?: string;
      onChangeClientState?: (newState: any) => void;
    }

    interface HelmetData {
      base: HelmetDatum;
      htmlAttributes: HelmetDatum;
      link: HelmetDatum;
      meta: HelmetDatum;
      script: HelmetDatum;
      style: HelmetDatum;
      title: HelmetDatum;
    }

    interface HelmetDatum {
      toString(): string;
      toComponent(): React.Component<any, any>;
    }

    class HelmetComponent extends React.Component<HelmetProps, any> {}

  }

  var Helmet: {
    (): ReactHelmet.HelmetComponent
    rewind(): ReactHelmet.HelmetData
  }
  namespace ReactHelmet {}
  export = Helmet;
  
}
