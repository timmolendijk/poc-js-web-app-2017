import * as React from 'react';
import { Provider } from 'react-redux';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { NS, Container, observable } from 'scoopy';

@observer class ScoopyComponent extends React.Component<{}, {}> {

  @observable private cheer: string = "joepie";

  @computed private get loudCheer() {
    return this.cheer.toUpperCase();
  }

  render() {
    return <div>
      <h1>{this.loudCheer} SCOOPY!</h1>
      <button type="button" onClick={() => this.cheer = "yay"}>yay</button>
      <button type="button" onClick={() => this.cheer = "aitait"}>aitait</button>
    </div>;
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
