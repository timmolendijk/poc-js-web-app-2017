import { inject } from 'mobx-react';

import { Stores } from 'State'
import { Member } from 'models';
import AttendeeItemStore from './store';
import { AttendeeItem, Props as RenderProps } from './render';

declare module 'State' {
  interface Stores {
    AttendeeItem?: AttendeeItemStore;
  }
}

interface Props {
  member: Member;
}

function storesToProps({ stores }: { stores: Stores }, { member }: Props): RenderProps {

  stores.add('AttendeeItem', () => new AttendeeItemStore());

  return {
    get name() {
      if (this.editing)
        return stores.AttendeeItem.name;
      return member.name;
    },
    profileUrl: member.profile,
    editing: stores.AttendeeItem.editing === member,
    onEdit() {
      stores.AttendeeItem.startEdit(member);
    },
    onName(value: string) {
      stores.AttendeeItem.name = value;
    },
    onSave() {
      // TODO(tim): Any benefit if we put these two mutations together in a
      // single action?
      member.name = stores.AttendeeItem.name;
      stores.AttendeeItem.endEdit();
    }
  };

}

export default inject(storesToProps)(AttendeeItem);
