import { inject } from 'mobx-react';

import { Stores } from 'State'
import { Event } from 'models';
import { EventStore } from './store';
import { EventItem, Props as RenderProps } from './render';

declare module 'State' {
  interface Stores {
    event?: EventStore
  }
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

interface Props {
  event: Event;
}

export default inject(storesToProps)(EventItem);
