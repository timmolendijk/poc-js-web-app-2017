import * as React from 'react';
import * as Helmet from 'react-helmet';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'amp-img': any;
    }
  }
}

export default function AmpImg(props) {

  return <amp-img {...props}>
    <Helmet script={[{
      async: undefined,
      src: "https://cdn.ampproject.org/v0.js"
    }]} />
  </amp-img>;

}
