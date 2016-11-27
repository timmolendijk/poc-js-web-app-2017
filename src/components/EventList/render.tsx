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
          <a href={event.pageUrl} target="_blank">{event.name}</a> in {event.venueName}
        </li>
      )}
    </ul>
  </div>;

}

export default EventList;
