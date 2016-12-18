import { observable, IObservableArray } from 'mobx';
import { IIdentity, Normalizer } from 'normalize';
import { IAwaitable, awaitProps } from 'await';
import { ITransport } from 'transport';
import { Member } from 'models';

export default class MemberChartStore implements IAwaitable {

  constructor({ members = [] }: { members?: ReadonlyArray<IIdentity> } = {}, normalizer: Normalizer) {
    this.members = members.map(identity => normalizer.instance<Member>(identity));
    this.transport = new Member.Transport(data => normalizer.instance<Member>(Member, data));
  }

  @observable private members: Array<Member>;
  private readonly transport: ITransport<Member>;

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
