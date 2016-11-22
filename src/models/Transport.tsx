import * as url from 'url';
import * as fetch from 'isomorphic-fetch';
import * as jsonp from 'jsonp';
import * as promisify from 'es6-promisify';
const jsonpAsync = promisify(jsonp);

import Member from './Member';

const endpoints = new Map([
  [Member, url.format({
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
  })]
]);

export interface Transport {
  list(Model, { incremental: boolean }): Promise<ReadonlyArray<any>>;
}

export const server: Transport = {

  async list(Model) {
    if (Model === Member) {
      const response = await fetch(endpoints.get(Model));
      if (!response.ok)
        throw new Error(`${response.status}: ${response.statusText}`);
      return await response.json();
    }
  }

};

export const client: Transport = {

  async list(Model) {
    if (Model === Member) {
      const { data, meta } = await jsonpAsync(endpoints.get(Model), { });
      if (data.errors && data.errors.length) {
        const { code, message } = data.errors[0];
        throw new Error(`${code}: ${message}`);
      }
      return data;
    }
  }

};
