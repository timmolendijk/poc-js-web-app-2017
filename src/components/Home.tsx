import * as styles from './Home.css';

import * as brandUrl from './brand.png';

import * as React from 'react';
import { inject } from 'mobx-react';
import { Style } from 'style';

import State from '../models/State';
import Member from '../models/Member';
import MemberChart from './MemberChart';

export default inject<{ state: State }>('state')(function Home({ state }) {

  return <div className="Home">
    <Style>{styles}</Style>
    <h1 className="hello">
      <img className="brand" src={brandUrl} alt="AmsterdamJS" />
    </h1>
    <h2>Home</h2>
    <MemberChart members={state.members.get()} />
  </div>;

});
