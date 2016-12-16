import { asReference } from 'mobx';
import { inject } from 'mobx-react';
import { propsObserver } from 'react-hoc';

import { Stores } from 'State'
import { Event } from 'models';
import EventStore from './store';
import * as render from './render';

declare module 'State' {
  interface Stores {
    event?: EventStore;
  }
}

interface Props {
  event: Event;
  stores?: Stores;
}

function storesToProps({ stores }: { stores: Stores }, props: Props): Props {

  stores.add('event', data => new EventStore(data, stores.normalizer));

  return {
    stores,
    ...props
  };
}

const propsToRenderProps = ({ event, stores }: Props): render.Props => ({
  name: event.name,
  pageUrl: event.pageUrl,
  venueName: event.venueName,
  startTime: event.startTime,
  get expanded() {
    return stores.event.isExpanded(event);
  },
  get attendees() {
    if (this.expanded)
      return event.attendees.get();
  },
  get loading() {
    // TODO(tim): The main reason for this early exit scenario is to keep
    // `event.attendees` latent (leverage its laziness) for as long as
    // possible. But the fact that we account for another component's
    // implementation detail is not really a desirable situation.
    if (!this.expanded)
      return false;
    return event.attendees.loading;
  },
  // TODO(tim): MobX v3 will fortunately no longer turn argumentless functions
  // into computed values, so this ugly use of `asReference` is only temporary.
  onExpand: asReference(() => {
    stores.event.expand(event);
  })
});

// TODO(tim): Using `compose` here would benefit readability, but TS seems to
// have some issues understanding `recompose/compose`'s type definition.
export default inject(storesToProps)(propsObserver(propsToRenderProps)(render.EventItem));
