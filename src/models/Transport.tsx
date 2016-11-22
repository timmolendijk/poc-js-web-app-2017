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
  list(Model, { cursor, isVirgin }: { cursor?: string, isVirgin?: boolean });
}

export const server: Transport = {

  list(Model, { cursor = endpoints.get(Model), isVirgin = true } = { }) {
    if (Model === Member)
      return {
        cursor,
        isVirgin,
        async step() {
          // TODO(tim): Better naming (maybe represent as step number?) and make
          // immutable.
          this.isVirgin = false;
          const response = await fetch(this.cursor);
          this.cursor = null;
          if (!response.ok)
            throw new Error(`${response.status}: ${response.statusText}`);
          for (const link of response.headers.getAll('link')) {
            const match = link.match(/^\<(.+)\>; rel="next"$/);
            if (match)
              this.cursor = match[1];
          }
          return await response.json();
        },
        next(): IteratorResult<Promise<ReadonlyArray<Member>>> {
          if (!this.cursor)
            return { done: true, value: undefined };
          
          const value = this.step();
          return { done: false, value };
        },
        [Symbol.iterator]() {
          return this;
        }
        // TODO(tim): What do `return` and `throw` methods do?
      };
  }

};

export const client: Transport = {

  list(Model, { cursor = endpoints.get(Model), isVirgin = true } = { }) {
    if (Model === Member) {
      return {
        cursor,
        // TODO(tim): Better naming (maybe represent as step number?) and make
        // immutable.
        isVirgin,
        async step() {
          this.isVirgin = false;
          const response = await jsonpAsync(this.cursor, {
            param: 'callback',
            name: 'cb'
          });
          this.cursor = null;
          if (response.data.errors && response.data.errors.length)
            throw new Error(`${response.data.errors[0].code}: ${response.data.errors[0].message}`);
          if (response.meta.next_link)
            this.cursor = response.meta.next_link;
          return response.data;
        },
        next(): IteratorResult<Promise<ReadonlyArray<Member>>> {
          if (!this.cursor)
            return { done: true, value: undefined };
          
          const value = this.step();
          return { done: false, value };
        },
        [Symbol.iterator]() {
          return this;
        }
        // TODO(tim): What do `return` and `throw` methods do?
      };
    }
  }

};
