import { observable } from 'mobx';
import { reportOnError } from 'error';
import { IIdentity, Normalizer } from 'normalize';
import { IAwaitable, awaitProps } from 'await';
import { ITransport, isTransportError } from 'transport';
import { Event } from 'models';

export default class EventListStore implements IAwaitable {

  constructor({ events = [] }: { events?: ReadonlyArray<IIdentity> } = {}, normalizer: Normalizer) {
    this.events = events.map(identity => normalizer.instance<Event>(identity));
    this.transport = new Event.Transport(data => normalizer.instance<Event>(Event, data));
  }

  @observable private events: Array<Event>;
  private readonly transport: ITransport<Event>;

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
