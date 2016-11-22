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
  loader: { cursor: string };
}

interface CollectionLoader<M> extends IterableIterator<Promise<ReadonlyArray<M>>> {
  cursor: string;
  isVirgin: boolean;
} 

export class MemberCollection {

  constructor(private readonly state: State, data?: SerializedMemberCollection) {
    if (data && data.data)
      this.data = data.data.map(d => this.state.getInstance(Member, d));
    this.loader = this.state.transport.list(Member, data && data.loader);
  }

  @observable private data: Member[] = [];
  private loader: CollectionLoader<Member>;
  
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
    if (this.loader.cursor)
      if (this.loader.isVirgin)
        this.load();
      else if (this.allowResumeLoad)
        this.resumeLoad();

    return this.data;
  }

  private async load() {
    // TODO(tim): Do not blindly assume that this first chunk exists.
    const chunk = this.loader.next().value;
    await this.loadChunk(chunk);
  }

  allowResumeLoad: boolean = false;

  private async resumeLoad() {
    this.allowResumeLoad = false;

    for (const chunk of this.loader) {
      await this.loadChunk(chunk);
    }
  }

  private async loadChunk(chunk) {
    // TODO(tim): Too late?
    this.startLoadChunk();
    let data;
    try {
      data = await chunk;
    } catch (err) {
      // TODO(tim): This will cause an infinite iteration of load attempts.
      this.endLoadChunk(null);
    }
    this.endLoadChunk(data.map(d => this.state.getInstance(Member, {
      id: d.id,
      name: d.name,
      image: d.photo ? d.photo.thumb_link : null
    })));
  }

  @action private startLoadChunk() {
    this.pending++;
  }

  @action private endLoadChunk(data) {
    this.pending--;
    if (data)
      this.data.push(...data);
    else
      this.data = []; 
  }

  toJSON() {
    return pick(this, ['data', 'loader']);
  }

}

// TODO(tim): Useful? Or confusing?
export default Member;
