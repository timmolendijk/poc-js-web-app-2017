import { observable, when, action } from 'mobx';
import { pick } from 'lodash';

import State from './State';

export interface SerializedMember {
  id: number;
  name: string;
  image: string;
}

export class Member implements SerializedMember {

  constructor(data?: SerializedMember) {
    Object.keys(data).forEach(key => {
      this[key] = data[key];
    });
  }

  readonly id;
  readonly name;
  readonly image;

  get profile(): string {
    return `http://www.meetup.com/AmsterdamJS/members/${this.id}/`;
  }

}

export interface SerializedMemberCollection {
  data: SerializedMember[];
}

export class MemberCollection {

  constructor(private readonly state: State, data?: SerializedMemberCollection) {
    if (data)
      this.data = data.data.map(d => this.state.getInstance(Member, d));
  }

  private data: Member[] = null;
  @observable private pending: number = 0;

  get stable(): Promise<any> {
    if (this.pending === 0)
      return;
    
    return new Promise(resolve =>
      when(
        () => this.pending === 0,
        resolve
      )
    );
  }

  get(): Member[] {
    if (this.data)
      return this.data;
    
    this.load();
    return [];
  }

  @action async load() {
    this.pending++;
    const payload = this.state.transport.list(Member, { incremental: true });
    let data;
    try {
      data = await payload;
    } catch (err) {
      this.data = null;
    } finally {
      this.pending--;
    }
    this.data = data.map(d => this.state.getInstance(Member, {
      id: d.id,
      name: d.name,
      image: d.photo ? d.photo.thumb_link : null
    }));
  }

  toJSON() {
    return pick(this, ['data']);
  }

}

// TODO(tim): Useful? Or confusing?
export default Member;
