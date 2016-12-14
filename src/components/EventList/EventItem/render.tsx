import * as styles from './index.css'

import * as React from 'react';
import { Style } from 'style';
import * as moment from 'moment';

export interface Props {
  name: string;
  pageUrl: string;
  venueName: string;
  startTime: moment.Moment;
  attendees: ReadonlyArray<{
    id: any;
    name: string;
  }>;
  loading: boolean;
  onExpand(): void;
}

export function EventItem({ name, pageUrl, venueName, startTime, attendees, loading, onExpand }: Props) {

  // TODO(tim): Using `li` here means that we make an assumption about where it
  // is used, which is not ideal when trying to keep coupling as loose as
  // possible.
  return <li onClick={onExpand} className="EventItem">
    <Style>{styles}</Style>
    <p>{startTime.format("dddd, MMMM Do YYYY, h:mm:ss a")}</p>
    <p><a href={pageUrl} target="_blank">{name}</a> at {venueName}</p>
    {renderLoader()}
    {renderAttendees()}
  </li>;

  function renderLoader() {
    if (!loading)
      return null;
    
    return <div>loading 👀</div>;
  }

  function renderAttendees() {
    if (!attendees || loading)
      return null;
    
    return <div>
      <h3>{attendees.length} attendees</h3>
      <ul>
        {attendees.map(member =>
          <li key={member.id}>{member.name}</li>
        )}
      </ul>
    </div>;
  }

}
