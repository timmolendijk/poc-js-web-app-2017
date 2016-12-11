import * as styles from './index.css'

import * as React from 'react';
import { observable, action } from 'mobx';
import { inject } from 'mobx-react';
import { Style } from 'style';
import * as moment from 'moment';

import { Stores } from 'State'
import { Identity, Normalizer } from 'Normalizable';
import { Event } from 'models';

declare module 'State' {
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
    name: event.name,
    pageUrl: event.pageUrl,
    venueName: event.venueName,
    startTime: event.startTime,
    attendees: stores.event.isExpanded(event) && event.attendees.get(),
    loading: event.attendees.loading,
    onExpand() {
      stores.event.expand(event);
    }
  };

}
 
interface RenderProps {
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

function EventItem({ name, pageUrl, venueName, startTime, attendees, loading, onExpand }: RenderProps) {

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
    
    return <div>
      ∞ l o a d i n g ∞
    </div>;
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

export default inject(storesToProps)(EventItem);
