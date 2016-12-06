import { inject } from 'mobx-react';

import { Stores } from '../../models/State'
import { MembersStore } from './store';
import { MemberChart, Props as RenderProps } from './render';

declare module '../../models/State' {
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

export default inject(storesToProps)(MemberChart) as React.StatelessComponent<Props>;
