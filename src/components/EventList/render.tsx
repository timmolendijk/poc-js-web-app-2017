import * as styles from './index.css'

import * as React from 'react';
import { Style } from 'style';

import { Event } from 'models';
import EventItem from './EventItem';

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
        <EventItem key={event.id} event={event} />
      )}
    </ul>
  </div>;

}

export default EventList;
