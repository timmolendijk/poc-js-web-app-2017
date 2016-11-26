import * as styles from './MemberChart.css'

import * as url from 'url';
import * as React from 'react';
import { observable } from 'mobx';
import { inject } from 'mobx-react';
import { Style } from 'style';

import { Awaitable, isAwaitable, awaitEmptyCallStack } from '../models/Awaitable';
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

interface MembersData {
  all?: ReadonlyArray<MemberData>;
}

class MembersStore implements Awaitable {

  constructor({ all = [] }: MembersData = { }, models: ModelRegistry) {
    // TODO(tim): This verbosity is caused by our currying magic. Alternative of
    // introducing a different method for this use case might be preferable.
    this.all = all.map(models.instance(Member) as (data) => Member);
    this.transport = new MemberTransport(models.instance(Member));
    this.load();
  }

  @observable all: Array<Member>;
  private readonly transport: MemberTransport;

  private async load() {
    if (process.env.RUN_ENV === 'server' && this.all.length)
      return;
    
    const page = this.transport.list();
    let instances;
    try {
      instances = await page;
    } catch (err) {
      return;
    }

    this.all = instances;
  }

  get await() {
    const awaiting = Object.keys(this)
      .map(key => this[key])
      .filter(isAwaitable)
      .map(value => value.await)
      .filter(Boolean);
    
    if (awaiting.length === 0)
      return;
    
    // Let all operations on call stack execute before reporting state as
    // stable.
    return awaitEmptyCallStack(awaiting);
  }

}

export default inject(({ stores }: { stores: Stores }) => {

  const members = stores.add('members', data => new MembersStore(data, stores.models));

  return {
    // TODO(tim): Silly type assertion.
    members: (members.all as any).peek()
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
