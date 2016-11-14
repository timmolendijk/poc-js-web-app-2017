import * as styles from './MemberChart.css'

import * as React from 'react';
import { Style } from 'style';

import Member from '../models/Member';
import MemberCard from './MemberCard';

export default function MemberChart({ members }: { members: Member[] }) {

  if (!members.length)
    return null;

  return <div className="MemberChart">
    <Style>{styles}</Style>
    {members.slice().reverse().map(member =>
      <MemberCard key={member.id} member={member} />
    )}
  </div>;

}
