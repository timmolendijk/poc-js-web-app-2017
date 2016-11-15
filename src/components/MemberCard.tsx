import * as styles from './MemberCard.css';

import * as React from 'react';
import { Style } from 'style';

import Member from '../models/Member';

export default function MemberCard({ member }: { member: Member }) {

  const backgroundImage = member.image && `url(${member.image})`;
  
  return <a key={member.id} href={member.profile} target="_blank"
    className="MemberCard" style={{ backgroundImage }}>
    <Style>{styles}</Style>
    <span className="name">{member.name}</span>
  </a>;

}
