import * as styles from './index.css'
import * as React from 'react';
import { observer } from 'mobx-react';
import { Style } from 'style';
import * as Mescy from 'mescy'
import Store from './store';

interface IProps {
  // TODO(tim): The fact that the injected store can also be provided as a
  // property should be modeled by the return type of `injectStore()`.
  store?: Store;
}

class EventList extends React.Component<IProps, {}> {

  render() {
    const { events, loading } = this.props.store;

    if (loading)
      return <strong>Loading</strong>;

    if (!events.length)
      return null;

    return <div className="EventList">
      <Style>{styles}</Style>
      <ul>
        {events.map(event =>
          <li key={event.id}>{event.name}</li>
        )}
      </ul>
    </div>;
  }

}

// TODO(tim): We should be able to apply these two HOCs as class decorators.
export default Mescy.inject(Store)(observer(EventList));
