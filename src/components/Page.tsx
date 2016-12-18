import * as styles from './Page.css';
import * as React from 'react';
import * as Helmet from 'react-helmet';
import { Style } from 'style';

const title = "AmsterdamJS";

const fontsUrl = "https://fonts.googleapis.com/css?family=Lato:100,300,400,700,900";

export default function Page({ children }: { children? }) {

  return <main className="Page">
    <Helmet defaultTitle={title} titleTemplate={`%s · ${title}`}
      link={[{ rel: 'stylesheet', href: fontsUrl }]} />
    <Style>{styles}</Style>
    {children}
  </main>;

}
