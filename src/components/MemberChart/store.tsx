import { observable } from 'mobx';

import { Awaitable, awaitProps } from '../../models/Awaitable';
import { ModelRegistry } from '../../models/Model';
import { Member, MemberData, MemberTransport } from '../../models/Member';

interface MembersStoreData {
  members?: ReadonlyArray<MemberData>;
}

export class MembersStore implements Awaitable {

  constructor({ members = [] }: MembersStoreData = {}, models: ModelRegistry) {
    // TODO(tim): This verbosity is caused by our currying magic. Alternative of
    // introducing a different method for this use case might be preferable.
    this.members = members.map(models.instance(Member) as (data) => Member);
    this.transport = new MemberTransport(models.instance(Member));
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
