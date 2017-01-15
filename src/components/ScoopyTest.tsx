import * as styles from './ScoopyTest.css';
import { createElement, Component } from 'react';
import { Provider } from 'react-redux';
import { Style } from 'react-style';
import { createStore, Store } from 'redux';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { IIdentifier, field, pending } from 'scoopy';
import { observable } from 'scoopy-mobx';
import * as classNames from 'classnames';
import { reportOnError } from 'error';
import { isTransportError } from 'transport';
import { Event } from 'models';

class Controller {

  @observable private events: ReadonlyArray<Event>;
  @observable loading: boolean = false;

  // TODO(tim): It would be nice if we can define type of `fallback` as
  // "anything, but if it is an array it should be holding instances of
  // `Event`".
  getEvents<F>(fallback: F = null) {
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

@observer export default class ScoopyTest extends Component<{}, {}> {

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
      {this.renderEventList()}
    </div>;
  }

  private renderEventList() {
    if (this.controller.loading)
      return <p>LOADING…</p>;
    
    return <ul className="EventList">
      {this.controller.getEvents([] as ReadonlyArray<Event>).map(event =>
        <li key={event.id}><EventItem id={event.id} event={event} /></li>
      )}
    </ul>;
  }

}

class EventItemController {

  @observable private expanded: ReadonlyArray<Event> = [];

  isExpanded(event: Event): boolean {
    return this.expanded.indexOf(event) !== -1;
  }

  expand(event: Event) {
    const expanded = new Set(this.expanded);
    expanded.add(event);
    this.expanded = [...expanded];
  }

  collapse(event: Event) {
    const expanded = new Set(this.expanded);
    expanded.delete(event);
    this.expanded = [...expanded];
  }

}

@observer class EventItem extends Component<{ id: IIdentifier, event: Event }, {}> {

  @field private controller = new EventItemController();

  @computed get isExpanded(): boolean {
    return this.controller.isExpanded(this.props.event);
  }
  set isExpanded(value: boolean) {
    this.controller[value ? 'expand' : 'collapse'](this.props.event);
  }

  render() {
    const className = classNames('EventItem', { expanded: this.isExpanded });
    return <div onClick={() => this.isExpanded = true} className={className}>
      <Style>{styles}</Style>
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
