import { inject } from 'mobx-react';

import { Stores } from 'State'
import { MembersStore } from './store';
import { MemberChart, Props as RenderProps } from './render';

declare module 'State' {
  interface Stores {
    members?: MembersStore
  }
}

function storesToProps({ stores }: { stores: Stores }): RenderProps {

  const members = stores.add('members', data => new MembersStore(data, stores.normalizer));

  return {
    members: members.get()
  };

}

export interface Props {}

export default inject(storesToProps)(MemberChart);
