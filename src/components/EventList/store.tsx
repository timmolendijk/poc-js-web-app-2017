import { observable } from 'mobx';

import { Awaitable, awaitProps } from '../../models/Awaitable';
import { ModelRegistry } from '../../models/Model';
import { Event, EventData, EventTransport } from '../../models/Event';

interface EventsStoreData {
  events?: ReadonlyArray<EventData>;
}

export class EventsStore implements Awaitable {

  constructor({ events = [] }: EventsStoreData = {}, models: ModelRegistry) {
    // TODO(tim): This verbosity is caused by our currying magic. Alternative of
    // introducing a different method for this use case might be preferable.
    this.events = events.map(models.instance(Event) as (data) => Event);
    this.transport = new EventTransport(models.instance(Event));
  }

  @observable private events: Array<Event>;
  private readonly transport: EventTransport;

  get(): ReadonlyArray<Event> {
    if (process.env.RUN_ENV !== 'server' || !this.events.length)
      this.load();

    // TODO(tim): Can we get rid of this silly type assertion?
    return (this.events as any).peek();
  }

  private async load() {
    if (this.events.length > 5)
      return;
    
    const page = this.transport.list({ max: 10 });
    let instances;
    try {
      instances = await page;
    } catch (err) {
      return;
    }

    this.events = instances;
  }

  get await() {
    return awaitProps(this);
  }

}

export default EventsStore;
