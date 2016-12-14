import * as styles from './index.css'

import * as React from 'react';
import { Style } from 'style';
import * as moment from 'moment';

import { Member } from 'models';
import AttendeeItem from './AttendeeItem';

export interface Props {
  name: string;
  pageUrl: string;
  venueName: string;
  startTime: moment.Moment;
  attendees: ReadonlyArray<Member>;
  loading: boolean;
  onExpand(): void;
}

export function EventItem({ name, pageUrl, venueName, startTime, attendees, loading, onExpand }: Props) {

  return <div onClick={onExpand} className="EventItem">
    <Style>{styles}</Style>
    <p>{startTime.format("dddd, MMMM Do YYYY, h:mm:ss a")}</p>
    <p><a href={pageUrl} target="_blank">{name}</a> at {venueName}</p>
    {renderLoader()}
    {renderAttendees()}
  </div>;

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
        {attendees.map(attendee =>
          <li key={attendee.id}><AttendeeItem member={attendee} /></li>
        )}
      </ul>
    </div>;
  }

}
