import * as styles from './index.css'
import * as React from 'react';
import { observer } from 'mobx-react';
import { Style } from 'style';
import { inject } from 'state';
import Controller from './controller';

interface IProps {}

@inject({ controller: () => new Controller() }) @observer
export default class EventList extends React.Component<IProps & { controller: Controller }, {}> {

  render() {
    const { events, loading } = this.props.controller;

    if (loading)
      return <strong>Loading</strong>;

    if (!events.length)
      return null;
    
    return <div className="EventList">
      <Style>{styles}</Style>
      <ul>
        {events.map(event =>
          <li key={event.id}>{event.name} ({event.startMoment.format("dddd, MMMM Do YYYY")})</li>
        )}
      </ul>
    </div>;
  }
  
}
