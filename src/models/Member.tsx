import * as url from 'url';
import { observable, computed } from 'mobx';
import * as fetch from 'isomorphic-fetch';
import * as jsonp from 'jsonp';
import * as promisify from 'es6-promisify';

interface MeetupMember {
  id: number;
  name: string;
  joined: number;
  photo?: {
    thumb_link: string;
    [field: string]: any;
  };
  [field: string]: any;
}

export default class Member {

  @observable id: number;
  @observable name: string;
  @observable joined: number;
  @observable image?: string;

  constructor(data: MeetupMember) {
    this.id = data.id;
    this.name = data.name;
    this.joined = data.joined;
    if (data.photo)
      this.image = data.photo.thumb_link;
  }

  @computed get url() {
    return `http://www.meetup.com/AmsterdamJS/members/${this.id}/`;
  }

}

const jsonpAsync = promisify(jsonp);

export async function jsonpMeetupMembers(): Promise<MeetupMember[]> {
  // TODO(tim): Use `url.format` to build URL.
  const url = "https://api.meetup.com/AmsterdamJS/members?desc=false&photo-host=public&page=200&sig_id=5314113&order=joined&sig=40ce35726d361ace595406080daf3ac36826bf05";
  const { data, meta } = await jsonpAsync(url, { });
  if (data.errors && data.errors.length) {
    const { code, message } = data.errors[0];
    throw new Error(`${code}: ${message}`);
  }
  return data;
}

export async function fetchMeetupMembers(): Promise<MeetupMember[]> {
  // TODO(tim): Use `url.format` to build URL.
  const url = "https://api.meetup.com/AmsterdamJS/members?desc=false&photo-host=public&page=200&sig_id=5314113&order=joined&sig=40ce35726d361ace595406080daf3ac36826bf05";
  const response = await fetch(url, {
    cache: 'no-cache'
  });
  if (!response.ok)
    throw new Error(`${response.status}: ${response.statusText}`);
  return await response.json();
}
