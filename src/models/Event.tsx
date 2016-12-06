import { observable, IObservableArray } from 'mobx';
import * as fetch from 'isomorphic-fetch';
import * as moment from 'moment';

import * as jsonp from 'jsonp';
import * as promisify from 'es6-promisify';
const jsonpAsync = promisify(jsonp);

import { reportOnError } from './Error';
import { Normalizable, registerType, Identity, Normalizer } from './Normalizable';
import { Awaitable, awaitAll, awaitProps } from './Awaitable';
import { Transport, createTransportError, isTransportError } from './Transport';
import { Member, MemberTransport } from './Member';

export interface EventData {
  id: number;
  name: string;
  pageUrl: string;
  venueName: string;
  startTime: number;
}

const endpoint = "https://api.meetup.com/AmsterdamJS/events?desc=true&photo-host=public&page=200&sig_id=5314113&status=past%2Cupcoming&sig=0fd5f3c192415dc26672d3bed99455481322375f";

const transports: {
  [env: string]: Transport<EventData>;
} = {};

function fromSourceFormat(data: any): EventData {
  return {
    id: data.id,
    name: data.name,
    pageUrl: data.link,
    venueName: data.venue.name,
    startTime: data.time
  };
}

transports['server'] = {

  async list() {
    const response = await fetch(endpoint);
    if (!response.ok)
      throw createTransportError('list', `${response.status}: ${response.statusText}`);
    return (await response.json()).map(fromSourceFormat);
  }

};

transports['client'] = {

  async list() {
    const response = await jsonpAsync(endpoint, {
      param: 'callback',
      name: 'cb'
    });
    if (response.data.errors && response.data.errors.length)
      throw createTransportError('list', `${response.status}: ${response.statusText}`);
    return response.data.map(fromSourceFormat);
  }

};

export class EventTransport implements Transport<Event>, Awaitable {

  constructor(private readonly mapResult: (data: EventData) => Event) {}

  private readonly transport = transports[process.env.RUN_ENV];
  private readonly awaiting = new Set<Promise<any>>();

  async list(opts?) {
    const promise = this.transport.list(opts);
    this.awaiting.add(promise);
    const response = await promise;
    this.awaiting.delete(promise);
    return response.map(this.mapResult);
  }

  get await() {
    return awaitAll([...this.awaiting]);
  }

  toJSON() {
    return;
  }

}

// TODO(tim): How can we make this awaitable?
class MemberCollection {

  constructor(items: ReadonlyArray<Identity> = [], normalizer: Normalizer) {
    this.items = items.map(identity => normalizer.instance<Member>(identity));
    this.transport = new MemberTransport(data => normalizer.instance<Member>(Member, data));
  }

  @observable private items: Array<Member>;
  private readonly transport: MemberTransport;

  get(): ReadonlyArray<Member> {
    if (!this.items.length)
      reportOnError(this.load());

    // TODO(tim): Is this the best place to do this type assertion?
    return (this.items as IObservableArray<Member>).peek();
  }

  private async load() {
    const page = this.transport.list({ max: 200 });
    let instances;
    try {
      instances = await page;
    } catch (err) {
      if (isTransportError(err))
        return;
      throw err;
    }
    this.items = instances;
  }

  toJSON() {
    return [...this.items];
  }

}

export class Event implements Normalizable {

  constructor(private readonly normalizer: Normalizer) {
    this.normalizer.onData(this, data => this.data = data);
  }

  private data: any = {};

  // TODO(tim): How to abstract this away?
  private _members: MemberCollection;
  get members() {
    this._members = this._members || new MemberCollection(this.data.members, this.normalizer);
    return this._members;
  }

  get id() {
    return this.data.id;
  }
  get name() {
    return this.data.name;
  }
  get pageUrl() {
    return this.data.pageUrl;
  }
  get venueName() {
    return this.data.venueName;
  }
  get startTime() {
    return moment(this.data.startTime);
  }

  toJSON() {
    return this.data;
  }

}

registerType(Event.name, Event);

export default Event;
