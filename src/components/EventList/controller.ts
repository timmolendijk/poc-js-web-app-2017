import { action, field, objects, observable } from 'state';
import { reportOnError } from 'error';
import { ITransport, isTransportError } from 'transport';
import { Event } from 'models';

export default class EventListController {

  constructor() {
    // TODO(tim): Move to some "lazy load" hook on `events` field.
    setTimeout(() => reportOnError(this.load()));
  }

  @observable(objects(field))() events: ReadonlyArray<Event> = [];
  @observable(field)() loading: boolean = false;

  async load() {
    this.startLoad();

    const transport: ITransport<Event> = new Event.Transport;
    const page = transport.list();
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

}
