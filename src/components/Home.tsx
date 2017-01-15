import * as styles from './Home.css';
import * as brandUrl from './brand.png';
import { createElement } from 'react';
import { Link } from 'react-router';
import { Style } from 'react-style';

export default function Home() {

  return <div className="Home">
    <Style>{styles}</Style>
    <div className="hello">
      <h1><img className="brand" src={brandUrl} alt="AmsterdamJS" /></h1>
      <Link to="/events">Our events</Link>
    </div>
    <h2>Home</h2>
  </div>;

};
