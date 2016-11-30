import * as styles from './index.css'

import * as React from 'react';
import { Style } from 'style';

import Event from '../../models/Event';

export interface Props {
  events: ReadonlyArray<Event>;
}

export function EventList({ events }: Props) {

  if (!events.length)
    return null;

  return <div className="EventList">
    <Style>{styles}</Style>
    <ul>
      {events.map(event =>
        <li key={event.id}>
          <p>{event.startTime.format("dddd, MMMM Do YYYY, h:mm:ss a")}</p>
          <p><a href={event.pageUrl} target="_blank">{event.name}</a> at {event.venueName}</p>
        </li>
      )}
    </ul>
  </div>;

}

export default EventList;
