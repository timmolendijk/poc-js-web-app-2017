import * as requestViaFetch from 'isomorphic-fetch';
import * as requestViaJsonp from 'jsonp';
import * as promisify from 'es6-promisify';

export interface Http {
  (url: string, opts?: { [param: string]: any }): Promise<any>;
}

export const fetch: Http = async function(url, opts) {
  const response = await requestViaFetch(url, opts);
  if (!response.ok)
    throw new Error(`${response.status}: ${response.statusText}`);
  return await response.json();
}

const requestViaJsonpAsync = promisify(requestViaJsonp);

export const jsonp: Http = async function(url) {
  const { data, meta } = await requestViaJsonpAsync(url, { });
  if (data.errors && data.errors.length) {
    const { code, message } = data.errors[0];
    throw new Error(`${code}: ${message}`);
  }
  return data;
}
