import { asReference } from 'mobx';
import { inject } from 'mobx-react';
import * as React from 'react';
import { propsObserver } from 'react-hoc';

import { Stores } from 'State'
import { Member } from 'models';
import AttendeeItemStore from './store';
import * as render from './render';

declare module 'State' {
  interface Stores {
    AttendeeItem?: AttendeeItemStore;
  }
}

interface Props {
  member: Member;
  stores?: Stores;
}

function storesToProps({ stores }: { stores: Stores }, props: Props): Props {

  stores.add('AttendeeItem', () => new AttendeeItemStore());

  return {
    stores,
    ...props
  };
}

const propsToRenderProps = ({ member, stores }: Props): render.Props => ({
  get name() {
    if (this.editing)
      return stores.AttendeeItem.name;
    return member.name;
  },
  profileUrl: member.profile,
  get editing() {
    return stores.AttendeeItem.editing === member;
  },
  onEdit: asReference(() => {
    stores.AttendeeItem.startEdit(member);
  }),
  onName: asReference((value: string) => {
    stores.AttendeeItem.name = value;
  }),
  onSave: asReference(() => {
    // TODO(tim): Any benefit if we put these two mutations together in a single
    // action?
    member.name = stores.AttendeeItem.name;
    stores.AttendeeItem.endEdit();
  })
});

export default inject(storesToProps)(propsObserver(propsToRenderProps)(render.AttendeeItem));
