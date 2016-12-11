import * as styles from './index.css'

import * as React from 'react';
import { Style } from 'style';

import { Member } from 'models';
import MemberCard from '../MemberCard';

export interface Props {
  members: ReadonlyArray<Member>;
}

export function MemberChart({ members }: Props) {

  if (!members.length)
    return null;

  return <div className="MemberChart">
    <Style>{styles}</Style>
    {members.map(member =>
      <MemberCard key={member.id} member={member} />
    )}
  </div>;

}

export default MemberChart;
