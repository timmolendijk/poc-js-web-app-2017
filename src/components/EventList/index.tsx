import * as styles from './index.css'
import * as React from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { Style } from 'style';
import { injectStore } from 'state'
import Store from './store';
import EventItem from './EventItem';

interface IProps {
  store?: Store;
}

const withStore = injectStore<IProps>(
  (data, stores) => new Store(data, stores.normalizer)
);

class EventList extends React.Component<IProps, {}> {

  render() {
    const events = this.props.store.get();

    if (!events.length)
      return null;

    return <div className="EventList">
      <Style>{styles}</Style>
      <ul>
        {events.map(event =>
          <li key={event.id}><EventItem event={event} /></li>
        )}
      </ul>
    </div>;
  }

}

export default withStore(observer(EventList));
