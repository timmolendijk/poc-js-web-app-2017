import * as React from 'react';
import { Provider } from 'react-redux';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { NS, Container, observable } from 'scoopy';
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

  private async load() {
    this.loading = true;

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

@observer class ScoopyComponent extends React.Component<{}, {}> {
  
  // TODO(tim): `observable` doesn't make much sense here.
  @observable private readonly controller = new Controller();

  @observable private cheer: string = "joepie";

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
        <li key={event.id}>{event.name}</li>
      )}
    </ul>;
  }

}

export default class ScoopyTest extends React.Component<{}, {}> {

  constructor(props) {
    super(props);

    let enhancer;
    if (process.env.RUN_ENV === 'client')
      enhancer = (window as any).__REDUX_DEVTOOLS_EXTENSION__();
    this.container = new Container(undefined, enhancer);
  }

  private readonly container: Container;

  render() {
    return (
      <Provider store={this.container.store}>
        <ScoopyComponent />
      </Provider>
    );
  }

}
