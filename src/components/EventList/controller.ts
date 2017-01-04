import { IAwaitable } from 'await';
import { action, field, objects, observable } from 'state';
import { reportOnError } from 'error';
import { ITransport, isTransportError } from 'transport';
import { Event } from 'models';

export default class EventListController implements IAwaitable {

  @observable(objects(field))({
    // TODO(tim): This feels like an ugly silly lazy loading construct.
    onGet(value) {
      if (value && value.length > 0 || this.loading)
        return;
      reportOnError(this.load());
    }
  }) events: ReadonlyArray<Event> = [];
  @observable(field)() loading: boolean = false;

  private readonly transport: ITransport<Event> & IAwaitable = new Event.Transport;

  async load() {
    this.startLoad();

    const page = this.transport.list();
    let instances;
    try {
      instances = await page;
    } catch (err) {
      if (isTransportError(err))
        return;
      throw err;
    }

    this.endLoad(instances);
  }

  @action
  startLoad() {
    this.loading = true;
  }

  @action
  endLoad(events) {
    this.events = events;
    this.loading = false;
  }

  get await() {
    return this.transport.await;
  }

}
