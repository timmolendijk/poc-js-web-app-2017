import * as React from 'react';
import { Provider } from 'react-redux';
import { createStore, Store } from 'redux';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { field, pending } from 'scoopy';
import { observable } from 'scoopy-mobx';
import { reportOnError } from 'error';
import { isTransportError } from 'transport';
import { Event } from 'models';

class Controller {

  @observable private events: ReadonlyArray<Event>;
  @observable loading: boolean = false;

  getEvents(fallback = null) {
    if (!this.events && !this.loading)
      reportOnError(this.load());
    
    return this.events || fallback;
  }

  @pending private async load() {
    // TODO(tim): Side-effect mutations cannot be performed synchronously
    // because it would result in a re-render being ordered while current render
    // has not yet ended. One may argue that triggering side-effects from a
    // render is an anti-pattern, but I cannot see how lazy-loading can be
    // implemented otherwise and I do not consider lazy-loading server-fetched
    // data an anti-pattern in itself.
    setTimeout(() => this.loading = true);

    const page = Event.transport.list();
    let instances;
    try {
      instances = await page;
    } catch (err) {
      if (isTransportError(err))
        return;
      throw err;
    }

    this.events = instances;
    this.loading = false;
  }

}

@observer export default class ScoopyTest extends React.Component<{}, {}> {

  @field private controller = new Controller();
  
  @observable private cheer = "joepie";

  @computed private get loudCheer() {
    return this.cheer.toUpperCase();
  }

  render() {
    return <div>
      <h1>{this.loudCheer} SCOOPY!</h1>
      <button type="button" onClick={() => this.cheer = "yay"}>yay</button>
      <button type="button" onClick={() => this.cheer = "aitait"}>aitait</button>
      {this.renderEvents()}
    </div>;
  }

  private renderEvents() {
    if (this.controller.loading)
      return <p>LOADING…</p>;
    
    return <ul>
      {this.controller.getEvents([]).map(event =>
        <li key={event.id}><EventItem event={event} /></li>
      )}
    </ul>;
  }

}

@observer class EventItem extends React.Component<{ event: Event }, {}> {

  @observable private isExpanded: boolean = false;

  render() {
    return <div onClick={() => this.isExpanded = true}>
      <p>{this.props.event.name}</p>
      {this.renderExpanded()}
    </div>;
  }

  private renderExpanded() {
    if (!this.isExpanded)
      return null;
    
    return <p>
      {this.props.event.pageUrl}<br />
      {this.props.event.venueName}
    </p>;
  }

}
