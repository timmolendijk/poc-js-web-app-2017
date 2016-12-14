import * as React from 'react';

export interface Props {
  name: string;
  profileUrl: string;
}

export function AttendeeItem({ name, profileUrl }) {
  return <a href={profileUrl} target="_blank">{name}</a>;
}
