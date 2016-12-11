import { observable } from 'mobx';

import { reportOnError } from 'Error';
import { Identity, Normalizer } from 'Normalizable';
import { Awaitable, awaitProps } from 'Awaitable';
import { isTransportError } from 'Transport';
import { Event, EventTransport } from 'models';

export class EventsStore implements Awaitable {

  constructor({ events = [] }: { events?: ReadonlyArray<Identity> } = {}, normalizer: Normalizer) {
    this.events = events.map(identity => normalizer.instance<Event>(identity));
    this.transport = new EventTransport(data => normalizer.instance<Event>(Event, data));
  }

  @observable private events: Array<Event>;
  private readonly transport: EventTransport;

  get(): ReadonlyArray<Event> {
    if (!this.events.length)
      reportOnError(this.load());

    // TODO(tim): Can we get rid of this silly type assertion?
    return (this.events as any).peek();
  }

  private async load() {
    const page = this.transport.list();
    let instances;
    try {
      instances = await page;
    } catch (err) {
      if (isTransportError(err))
        return;
      throw err;
    }

    this.events = instances;
  }

  get await() {
    return awaitProps(this);
  }

}

export default EventsStore;
