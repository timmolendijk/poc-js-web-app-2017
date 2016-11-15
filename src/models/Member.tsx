import * as url from 'url';
import { observable, action, when } from 'mobx';

import { Http } from './Http';

interface SerializedMemberCollection {
  data: SerializedMember[];
}

class MemberCollection {

  constructor(http: Http, data?: Member[]);
  constructor(http: Http, data?: SerializedMember[]);
  constructor(http: Http, data?: SerializedMemberCollection);
  constructor(private readonly http: Http, data?: any) {
    if (data && data.data)
      data = data.data;
    if (data instanceof Array)
      this.data = data.map(Member.instance);
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
  
  get isLoaded(): boolean {
    return Boolean(this.data);
  }

  all({ incremental = false }: { incremental?: boolean } = { }): Member[] {
    // TODO(tim): Load all data, unless `incremental` is true in which case we
    // should persist which data remains to be loaded, and implement some kind
    // of resume method that will trigger it.
    if (!this.isLoaded)
      this.load();
    
    return this.data || [];
  }

  // TODO(tim): Are we sure `@action` is used in a purposeful manner here? which
  // purpose exactly?
  @action async load() {
    this.pending++;
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
    let data;
    try {
      data = await this.http(endpoint);
    } catch (err) {
      this.data = null;
    } finally {
      this.pending--;
    }
    this.data = data.map(Member.instance);
  }

}

type Id = number;
type Url = string;

interface MemberData {
  id: Id;
  name: string;
  photo?: {
    thumb_link: Url
  };
  [other: string]: any;
  data?: never;
}

interface SerializedMember {
  data: MemberData;
}

class Member {

  private constructor(data: MemberData);
  private constructor(data: SerializedMember);
  private constructor(data) {
    if (data.data)
      data = data.data;
    this.data = data;
  }

  static instance(data: Member);
  static instance(data: MemberData);
  static instance(data) {
    if (data instanceof Member)
      return data;
    return new Member(data);
  }

  // TODO(tim): `Member.Collection` does not seem to be usable as a type.
  static readonly Collection = MemberCollection;

  private data: MemberData;

  get id(): Id {
    return this.data.id;
  }
  get name(): string {
    return this.data.name;
  }
  get image(): Url {
    if (!this.data.photo)
      return null;
    return this.data.photo.thumb_link;
  }
  get profile(): Url {
    return `http://www.meetup.com/AmsterdamJS/members/${this.id}/`;
  }

}

export { Member, MemberCollection };

// TODO(tim): Useful? Or confusing?
export default Member;
