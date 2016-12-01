import { observable, IObservableArray } from 'mobx';
import * as fetch from 'isomorphic-fetch';
import * as moment from 'moment';

import * as jsonp from 'jsonp';
import * as promisify from 'es6-promisify';
const jsonpAsync = promisify(jsonp);

import { Normalizable, registerType, Identity, Registry } from './Normalizable';
import { Awaitable, awaitAll, awaitProps } from './Awaitable';
import Transport from './Transport';
import { Member, MemberTransport } from './Member';

export interface EventData {
  id: number;
  name: string;
  pageUrl: string;
  venueName: string;
  startTime: number;
}

const endpoint = "https://api.meetup.com/AmsterdamJS/events?desc=false&photo-host=public&page=200&sig_id=5314113&status=past%2Cupcoming&sig=3710175683c3046e8fe2a0d1bb453aac3e935866";

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
      throw new Error(`${response.status}: ${response.statusText}`);
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
      throw new Error(`${response.data.errors[0].code}: ${response.data.errors[0].message}`);
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

  constructor(items: ReadonlyArray<Identity> = [], models: Registry) {
    this.items = items.map(identity => models.get<Member>(identity));
    this.transport = new MemberTransport(data => models.normalize(new Member(data)));
  }

  @observable private items: Array<Member>;
  private readonly transport: MemberTransport;

  get(): ReadonlyArray<Member> {
    if (!this.items.length)
      this.load();

    // TODO(tim): Is this the best place to do this type assertion?
    return (this.items as IObservableArray<Member>).peek();
  }

  private async load() {
    const page = this.transport.list({ max: 200 });
    let instances;
    try {
      instances = await page;
    } catch (err) {
      return;
    }
    this.items = instances;
  }

  toJSON() {
    return [...this.items];
  }

}

export class Event implements Normalizable {

  constructor({ data, members = [] }: { data: EventData, members?: ReadonlyArray<Identity> }, models: Registry) {
    this.data = data;
    this.members = new MemberCollection(members, models);
  }

  private readonly data: EventData;
  readonly members: MemberCollection;

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

}

registerType(Event.name, Event);

export default Event;
