import * as url from 'url';
import * as fetch from 'isomorphic-fetch';

import * as jsonp from 'jsonp';
import * as promisify from 'es6-promisify';
const jsonpAsync = promisify(jsonp);

import Model from './Model';
import Awaitable from './Awaitable';
import Transport from './Transport';

export interface MemberData {
  id: number;
  name: string;
  image: string;
}

const endpoint = url.format({
  protocol: 'https',
  hostname: 'api.meetup.com',
  pathname: 'AmsterdamJS/members',
  query: {
    desc: 'false',
    'photo-host': 'public',
    page: 200,
    sig_id: '5314113',
    order: 'joined',
    sig: '40ce35726d361ace595406080daf3ac36826bf05'
  }
});

const transports: {
  [env: string]: Transport<MemberData>;
} = { };

function fromSourceFormat(data: any): MemberData {
  return {
    id: data.id,
    name: data.name,
    image: data.photo ? data.photo.thumb_link : null
  };
}

transports['server'] = {

  async list({ max } = { }) {
    const response = await fetch(endpoint);
    if (!response.ok)
      throw new Error(`${response.status}: ${response.statusText}`);
    return (await response.json()).slice(0, Math.min(5, max)).map(fromSourceFormat);
  }

};

transports['client'] = {

  async list({ max } = { }) {
    const response = await jsonpAsync(endpoint, {
      param: 'callback',
      name: 'cb'
    });
    if (response.data.errors && response.data.errors.length)
      throw new Error(`${response.data.errors[0].code}: ${response.data.errors[0].message}`);
    return response.data.slice(0, max).map(fromSourceFormat);
  }

};

export class MemberTransport implements Transport<Member>, Awaitable {

    constructor(private readonly mapResult: (data: MemberData) => Member) {}

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
      if (this.awaiting.size === 0)
        return;
      
      return Promise.all([...this.awaiting]);
    }

    toJSON() {
      return;
    }

}

export class Member implements Model, MemberData {

  constructor(data?: MemberData) {
    Object.keys(data).forEach(key => {
      this[key] = data[key];
    });
  }

  readonly id;
  readonly name;
  readonly image;

  get profile(): string {
    return `https://www.meetup.com/AmsterdamJS/members/${this.id}/`;
  }

}

// TODO(tim): Useful? Or confusing?
export default Member;
