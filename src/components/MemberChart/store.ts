import { observable, IObservableArray } from 'mobx';

import { Identity, Normalizer } from 'Normalizable';
import { Awaitable, awaitProps } from 'Awaitable';
import { Member, MemberTransport } from 'models';

export class MembersStore implements Awaitable {

  constructor({ members = [] }: { members?: ReadonlyArray<Identity> } = {}, normalizer: Normalizer) {
    this.members = members.map(identity => normalizer.instance<Member>(identity));
    this.transport = new MemberTransport(data => normalizer.instance<Member>(Member, data));
  }

  @observable private members: Array<Member>;
  private readonly transport: MemberTransport;

  get(): ReadonlyArray<Member> {
    if (process.env.RUN_ENV !== 'server' || !this.members.length)
      this.load();

    // TODO(tim): Is this the best place to do this type assertion?
    return (this.members as IObservableArray<Member>).peek();
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
