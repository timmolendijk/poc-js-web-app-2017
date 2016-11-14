import * as React from 'react';
import * as Helmet from 'react-helmet';

const ComponentName = 'amp-img';

export default function AmpImg(props) {

  return <ComponentName {...props}>
    <Helmet script={[{
      async: undefined,
      src: "https://cdn.ampproject.org/v0.js"
    }]} />
  </ComponentName>;

}
