import { observable } from 'mobx';

import { Identity, Registry } from '../../models/Normalizable';
import { Awaitable, awaitProps } from '../../models/Awaitable';
import { Member, MemberTransport } from '../../models/Member';

export class MembersStore implements Awaitable {

  constructor({ members = [] }: { members?: ReadonlyArray<Identity> } = {}, models: Registry) {
    this.members = members.map(identity => models.get<Member>(identity));
    this.transport = new MemberTransport(data => models.normalize(new Member(data)));
  }

  @observable private members: Array<Member>;
  private readonly transport: MemberTransport;

  get(): ReadonlyArray<Member> {
    if (process.env.RUN_ENV !== 'server' || !this.members.length)
      this.load();

    // TODO(tim): Can we get rid of this silly type assertion?
    return (this.members as any).peek();
  }

  private async load() {
    if (this.members.length >= 200)
      return;
    
    const page = this.transport.list({ max: 200 });
    let instances;
    try {
      instances = await page;
    } catch (err) {
      return;
    }

    this.members = instances;
  }

  get await() {
    return awaitProps(this);
  }

}

export default MembersStore;
