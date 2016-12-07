import * as styles from './index.css'

import * as React from 'react';
import { observable, action } from 'mobx';
import { inject } from 'mobx-react';
import { Style } from 'style';
import * as moment from 'moment';

import { Stores } from '../../../models/State'
import { Identity, Normalizer } from '../../../models/Normalizable';
import Event from '../../../models/Event';

declare module '../../../models/State' {
  interface Stores {
    event?: EventStore
  }
}

class EventStore {

  constructor({ expanded = [] }: { expanded?: ReadonlyArray<Identity> } = {}, normalize: Normalizer) {
    this.expanded = expanded.map(identity => normalize.get<Event>(identity));
  }

  @observable private readonly expanded: Array<Event>;

  @action expand(event: Event) {
    if (!this.isExpanded(event))
      this.expanded.push(event);
  }

  isExpanded(event: Event): boolean {
    return this.expanded.indexOf(event) !== -1;
  }

}

interface Props {
  event: Event;
}

function storesToProps({ stores }: { stores: Stores }, { event }: Props): RenderProps {

  stores.add('event', data => new EventStore(data, stores.normalizer));

  return {
    event,
    attendees: stores.event.isExpanded(event) && event.attendees.get(),
    onExpand() {
      stores.event.expand(event);
    }
  };

}
 
interface RenderProps {
  event: {
    name: string;
    pageUrl: string;
    venueName: string;
    startTime: moment.Moment;
  };
  attendees: ReadonlyArray<{
    id: any;
    name: string;
  }>;
  onExpand(): void;
}

function EventItem({ event, attendees, onExpand }: RenderProps) {

  // TODO(tim): Using `li` here means that we make an assumption about where it
  // is used, which is not ideal when trying to keep coupling as loose as
  // possible.
  return <li onClick={onExpand} className="EventItem">
    <Style>{styles}</Style>
    <p>{event.startTime.format("dddd, MMMM Do YYYY, h:mm:ss a")}</p>
    <p><a href={event.pageUrl} target="_blank">{event.name}</a> at {event.venueName}</p>
    {renderAttendees()}
  </li>;

  function renderAttendees() {
    if (!attendees)
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

export default inject(storesToProps)(EventItem);
