import { inject } from 'mobx-react';

import { Stores } from 'State'
import { Member } from 'models';
import { AttendeeItem, Props as RenderProps } from './render';

interface Props {
  member: Member;
}

function storesToProps({ stores }: { stores: Stores }, { member }: Props): RenderProps {
  return {
    name: member.name,
    profileUrl: member.profile
  };

}

export default inject(storesToProps)(AttendeeItem);
