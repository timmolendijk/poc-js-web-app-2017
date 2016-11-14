import * as styles from './Event.css';

import * as React from 'react';
import * as Helmet from 'react-helmet';
import { Style } from 'style';

import AmpImg from './AmpImg';

const name = "My Event";

function AmpYoutube(props) {
  const Component = 'amp-youtube';
  return <div>
    <Helmet script={[{
      async: undefined,
      'custom-element': Component,
      src: "https://cdn.ampproject.org/v0/amp-youtube-0.1.js"
    }]} />
    <Component {...props} />
  </div>;
}

function AmpImageLightbox(props) {
  const Component = 'amp-image-lightbox';
  return <div>
    <Helmet script={[{
      async: undefined,
      'custom-element': Component,
      src: "https://cdn.ampproject.org/v0/amp-image-lightbox-0.1.js"
    }]} />
    <Component {...props} />
  </div>;
}

export default function Event({ pathname }) {

  const image = {
    src: "http://photos1.meetupstatic.com/photos/event/e/3/5/3/event_453958195.jpeg",
    width: 360,
    height: 240
  };

  // TODO(tim): Replace path URL with full-blown URL.
  return <div className="Event">
    <Helmet title={name} link={[{ rel: 'canonical', href: pathname }]} />
    <Style>{styles}</Style>
    <a href="/">Home</a>
    <h1>{name}</h1>
    <aside className="media">
      <AmpImg on="tap:lightbox" role="button" tabindex="0" alt={name} layout="responsive" {...image} />
      <AmpYoutube data-videoid="mGENRKrdoGY" layout="responsive" width="480" height="270" />
    </aside>
    {/* TODO(tim): Using `id` in a reusable component is not a good idea. */}
    <AmpImageLightbox id="lightbox" layout="nodisplay" />
  </div>;

};