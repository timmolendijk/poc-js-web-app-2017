import { observable, computed, asReference } from 'mobx';
import { field, getContainer, getUntrackedField, setUntrackedField } from 'state';
import { reportOnError } from 'error';
import { ITransport, isTransportError } from 'transport';
import { Event } from 'models';
import { pick } from 'lodash';

export default class EventListController {

  constructor(data?) {
    Object.assign(this, {
      events: [],
      loading: false
    }, pick(data, ['events']));

    setTimeout(() => reportOnError(this.load()));
  }

  private _observable_events;
  @field(
    (refs, hydrate) => refs.map(hydrate),
    (events, dehydrate) => events.map(dehydrate),
    function () {
      const container = getContainer(this);
      this._observable_events = observable(asReference(undefined));
      this._observable_events.set(container.getField(this, 'events'));
      container.store.subscribe(() =>
        this._observable_events.set(container.getField(this, 'events'))
      );
    }
  )
  @computed get events(): ReadonlyArray<Event> {
    const container = getContainer(this);
    if (container)
      return this._observable_events.get().map(ref => container.getObject(ref));
    else
      return getUntrackedField(this, 'events');
  }
  set events(value: ReadonlyArray<Event>) {
    const container = getContainer(this);
    if (container)
      container.setField(this, 'events', value.map(object => container.createReference(object)));
    else
      setUntrackedField(this, 'events', value);
  }

  private _observable_loading;
  @field(undefined, undefined, function () {
    const container = getContainer(this);
    this._observable_loading = observable(asReference(undefined));
    this._observable_loading.set(container.getField(this, 'loading'));
    container.store.subscribe(() =>
      this._observable_loading.set(container.getField(this, 'loading'))
    );
  })
  get loading(): boolean {
    const container = getContainer(this);
    if (container)
      return this._observable_loading.get();
    else
      return getUntrackedField(this, 'loading');
  }
  set loading(value: boolean) {
    const container = getContainer(this);
    if (container)
      container.setField(this, 'loading', value);
    else
      setUntrackedField(this, 'loading', value);
  }

  // TODO(tim): Caller should wrap its call to `load` in `reportOnError`.
  async load() {
    this.loading = true;

    const transport: ITransport<Event> = new Event.Transport;
    const page = transport.list();
    let instances;
    try {
      instances = await page;
    } catch (err) {
      // TODO(tim)
      console.log(err);
      if (isTransportError(err))
        return;
      throw err;
    }

    this.events = instances;
    this.loading = false;
  }

}
