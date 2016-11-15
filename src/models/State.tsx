import { Http } from './Http';
import { MemberCollection } from './Member';

export default class State {

  constructor(http: Http, data: any = { }) {
    this.members = new MemberCollection(http, data.members);
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

}
