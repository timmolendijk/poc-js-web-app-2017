import { inject } from 'mobx-react';

import { Stores } from 'State'
import { EventsStore } from './store';
import { EventList, Props as RenderProps } from './render';

declare module 'State' {
  interface Stores {
    events?: EventsStore
  }
}

export interface Props {}

function storesToProps({ stores }: { stores: Stores }): RenderProps {

  const events = stores.add('events', data => new EventsStore(data, stores.normalizer));

  return {
    events: events.get()
  };

}

export default inject(storesToProps)(EventList);
