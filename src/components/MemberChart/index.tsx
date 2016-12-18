import * as styles from './index.css'
import * as React from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { Style } from 'style';
import { injectStore } from 'state'
import Store from './store';
import MemberCard from '../MemberCard';

interface IProps {
  store?: Store;
}

const withStore = injectStore<IProps>(
  (data, stores) => new Store(data, stores.normalizer)
);

class MemberChart extends React.Component<IProps, {}> {

  render() {
    const members = this.props.store.get();

    if (!members.length)
      return null;

    return <div className="MemberChart">
      <Style>{styles}</Style>
      {members.map(member =>
        <MemberCard key={member.id} member={member} />
      )}
    </div>;
  }

}

export default withStore(observer(MemberChart));
