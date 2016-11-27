import * as url from 'url';
import * as fetch from 'isomorphic-fetch';

import * as jsonp from 'jsonp';
import * as promisify from 'es6-promisify';
const jsonpAsync = promisify(jsonp);

import Model from './Model';
import { Awaitable, awaitAll } from './Awaitable';
import Transport from './Transport';

type Url = string;

export interface EventData {
  id: number;
  name: string;
  pageUrl: Url;
  venueName: string;
}

const endpoint = "https://api.meetup.com/AmsterdamJS/events?photo-host=public&page=200&sig_id=5314113&status=past%2Cupcoming&sig=90911f77f51b580ae5e554666a2e39b104677c76";

const transports: {
  [env: string]: Transport<EventData>;
} = {};

function fromSourceFormat(data: any): EventData {
  return {
    id: data.id,
    name: data.name,
    pageUrl: data.link,
    venueName: data.venue.name
  };
}

transports['server'] = {

  async list({ max } = {}) {
    const response = await fetch(endpoint);
    if (!response.ok)
      throw new Error(`${response.status}: ${response.statusText}`);
    return (await response.json()).slice(0, Math.min(5, max)).map(fromSourceFormat);
  }

};

transports['client'] = {

  async list({ max } = {}) {
    const response = await jsonpAsync(endpoint, {
      param: 'callback',
      name: 'cb'
    });
    if (response.data.errors && response.data.errors.length)
      throw new Error(`${response.data.errors[0].code}: ${response.data.errors[0].message}`);
    return response.data.slice(0, max).map(fromSourceFormat);
  }

};

export class EventTransport implements Transport<Event>, Awaitable {

    constructor(private readonly mapResult: (data: EventData) => Event) {}

    private readonly transport = transports[process.env.RUN_ENV];
    private readonly awaiting = new Set<Promise<any>>();

    async list(opts) {
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

export class Event implements Model, EventData {

  constructor(data?: EventData) {
    Object.assign(this, data);
  }

  readonly id;
  readonly name;
  readonly pageUrl;
  readonly venueName;

}

export default Event;
