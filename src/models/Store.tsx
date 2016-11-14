import * as Koa from 'koa';
import * as React from 'react';
import { action } from 'mobx';

import Member from './Member';
import { fetchMeetupMembers } from './Member';

export default class Store {

  constructor(request?: Koa.Request, membersData?: Array<any>) {
    // TODO(tim): Do we want to store anything from `request`?
    if (membersData)
      this._members = membersData.map(d => new Member({
        id: d.id,
        name: d.name,
        joined: d.joined,
        photo: {
          thumb_link: d.image
        }
      }));
  }

  private _loading = [];
  get loading() {
    return Promise.all(this._loading);
  }

  private _members;
  get members() {
    if (!this._members)
      this.loadMembers();
    return this._members;
  }

  @action async loadMembers() {
    this._members = [];
    const list = fetchMeetupMembers(); 
    this._loading.push(list);
    this._members = (await list).slice(0, 10).map(d => new Member(d));
  }

  serialize() {
    return {
      members: this._members
    }
  }

  static deserialize(data) {
    return new Store(null, data.members);
  }

}
