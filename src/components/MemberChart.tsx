import * as styles from './MemberChart.css'

import * as url from 'url';
import * as React from 'react';
import { observable } from 'mobx';
import { inject } from 'mobx-react';
import { Style } from 'style';

import { Awaitable, awaitProps } from '../models/Awaitable';
import { Stores } from '../models/State'
import Transport from '../models/Transport';
import { ModelRegistry } from '../models/Model';
import { Member, MemberData, MemberTransport } from '../models/Member';
import MemberCard from './MemberCard';

declare module '../models/State' {
  export interface Stores {
    members?: MembersStore
  }
}

interface MembersStoreData {
  members?: ReadonlyArray<MemberData>;
}

class MembersStore implements Awaitable {

  constructor({ members = [] }: MembersStoreData = { }, models: ModelRegistry) {
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

export default inject(({ stores }: { stores: Stores }) => {

  const members = stores.add('members', data => new MembersStore(data, stores.models));

  return {
    members: members.get()
  };

})(function MemberChart({ members }: { members: ReadonlyArray<Member> }) {

  if (!members.length)
    return null;

  return <div className="MemberChart">
    <Style>{styles}</Style>
    {members.map(member =>
      <MemberCard key={member.id} member={member} />
    )}
  </div>;

}) as React.StatelessComponent<{ }>;
