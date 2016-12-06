import { inject } from 'mobx-react';

import { Stores } from '../../models/State'
import { EventsStore } from './store';
import { EventList, Props as RenderProps } from './render';

declare module '../../models/State' {
  interface Stores {
    events?: EventsStore
  }
}

function storesToProps({ stores }: { stores: Stores }): RenderProps {

  const events = stores.add('events', data => new EventsStore(data, stores.normalizer));

  return {
    events: events.get()
  };

}

export interface Props {}

export default inject(storesToProps)(EventList) as React.StatelessComponent<Props>;
