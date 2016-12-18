import * as styles from './index.css'
import * as React from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { Style } from 'style';
import { injectStore } from 'state'
import { Event } from 'models';
import Store from './store';
import AttendeeItem from './AttendeeItem';

interface IProps {
  event: Event;
  store?: Store;
}

const withStore = injectStore<IProps>(
  (data, stores) => new Store(data, stores.normalizer)
);

class EventItem extends React.Component<IProps, {}> {

  @computed get expanded() {
    return this.props.store.isExpanded(this.props.event);
  }

  onExpand = () => {
    this.props.store.expand(this.props.event);
  };

  render() {
    const { event, store } = this.props;

    return <div onClick={this.onExpand} className="EventItem">
      <Style>{styles}</Style>
      <p>{event.startTime.format("dddd, MMMM Do YYYY, h:mm:ss a")}</p>
      <p><a href={event.pageUrl} target="_blank">{event.name}</a> at {event.venueName}</p>
      {this.renderExpanded()}
    </div>;
  }

  renderExpanded() {
    if (!this.expanded)
      return null;
    
    // TODO(tim): Currently this gives a collection, but I think it would be
    // more powerful if we would get a subtype of `ReadonlyArray`, that adds
    // omnipresent attributes such as `loading` and `size`. That way we would
    // get true lazy loading.
    const attendees = this.props.event.attendees;

    if (attendees.loading)
      return <Loading />;
    
    return <div>
      <h3>{attendees.get().length} attendees</h3>
      <ul>
        {attendees.get().map(attendee =>
          <li key={attendee.id}><AttendeeItem member={attendee} /></li>
        )}
      </ul>
    </div>;
  }
  
}

function Loading() {
  return <div>loading 👀</div>;
}

export default withStore(observer(EventItem));
