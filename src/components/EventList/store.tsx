import { observable } from 'mobx';

import { Identity, Registry } from '../../models/Normalizable';
import { Awaitable, awaitProps } from '../../models/Awaitable';
import { Event, EventTransport } from '../../models/Event';

export class EventsStore implements Awaitable {

  constructor({ events = [] }: { events?: ReadonlyArray<Identity> } = {}, models: Registry) {
    this.events = events.map(identity => models.get<Event>(identity));
    this.transport = new EventTransport(data => models.normalize(new Event(data)));
  }

  @observable private events: Array<Event>;
  private readonly transport: EventTransport;

  get(): ReadonlyArray<Event> {
    if (!this.events.length)
      this.load();

    // TODO(tim): Can we get rid of this silly type assertion?
    return (this.events as any).peek();
  }

  private async load() {
    const page = this.transport.list();
    let instances;
    try {
      instances = await page;
    } catch (err) {
      return;
    }

    this.events = instances.reverse();
  }

  get await() {
    return awaitProps(this);
  }

}

export default EventsStore;
