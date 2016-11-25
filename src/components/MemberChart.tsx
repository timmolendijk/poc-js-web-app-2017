import * as styles from './MemberChart.css'

import * as url from 'url';
import * as React from 'react';
import { observable } from 'mobx';
import { inject } from 'mobx-react';
import { Style } from 'style';

import { State, StateFields } from '../models/State'
import Transport from '../models/Transport';
import { Member, MemberTransport } from '../models/Member';
import MemberCard from './MemberCard';

declare module '../models/State' {
  interface StateFields {
    members?: Array<Member>;
    memberTransport?: Transport<Member>;
  }
}

export default inject(({ state }: { state: State }) => {

  const { models } = state.fields;

  // TODO(tim): These should be neatly represented in their own component-level
  // class, which can then use `@observable` and hold async functions very
  // elegantly.
  const { members } = state.add('members', (data = []) =>
    observable(data.map(models.instance(Member)))
  );
  const { memberTransport } = state.add('memberTransport', () =>
    new MemberTransport(models.instance(Member))
  );

  !async function () {
    // TODO(tim): This code should not be inside the observed function.
    if (process.env.RUN_ENV === 'server' && members.length || members.length >= 200)
      return;
    
    const page = memberTransport.list();
    let instances;
    try {
      instances = await page;
    } catch (err) {
      return;
    }

    members.splice(0, members.length, ...instances);
  }();

  // TODO(tim): This is really the only piece of code that should be inside this
  // (observing) inject mapper.
  return { members: (members as any).peek() };

})(function MemberChart({ members }: { members: ReadonlyArray<Member> }) {

  if (!members.length)
    return null;

  return <div className="MemberChart">
    <Style>{styles}</Style>
    {members.map(member =>
      <MemberCard key={member.id} member={member} />
    )}
  </div>;

}) as React.StatelessComponent<{ }>;
