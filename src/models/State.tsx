import { pick } from 'lodash';

import { Transport } from './Transport';
import { SerializedMemberCollection, MemberCollection } from './Member';

interface SerializedState {
  members: SerializedMemberCollection; 
}

export default class State {

  constructor(public readonly transport: Transport, data?: SerializedState) {
    this.transport = transport;

    this.members = new MemberCollection(this, data && data.members);
  }

  readonly members: MemberCollection;

  get stable(): Promise<any> {
    const busy = [
      this.members.stable
    ].filter(Boolean);
    
    if (busy.length === 0)
      return;
    
    return Promise.all(busy);
  }

  set allowResumeLoad(value: boolean) {
    this.members.allowResumeLoad = value;
  }

  getInstance(Model, data) {
    return new Model(data);
  }

  toJSON() {
    return pick(this, ['members']);
  }

}
