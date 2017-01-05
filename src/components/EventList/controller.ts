import { when } from 'mobx';
import { IAwaitable } from 'await';
import { action, field, objects, observable } from 'state';
import { reportOnError } from 'error';
import { isTransportError } from 'transport';
import { Event } from 'models';

export default class EventListController implements IAwaitable {

  @observable(objects(field))() private events: ReadonlyArray<Event>;
  @observable(field)() loading: boolean = false;

  getEvents() {
    if (!this.events && !this.loading)
      reportOnError(this.load());

    // TODO(tim): Do not substitute `undefined` for empty array to remain
    // explicit about difference between no data and empty list?
    return this.events || [];
  }

  async load() {
    this.startLoad();

    const page = Event.transport.list();
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
    if (!this.loading)
      return;
    return new Promise(resolve =>
      when(
        () => !this.loading,
        resolve
      )
    );
  }

}
