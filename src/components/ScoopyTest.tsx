import * as React from 'react';
import { Provider } from 'react-redux';
import { createStore, Store } from 'redux';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { field } from 'scoopy';
import { reducer } from 'scoopy/store';
import { observable } from 'scoopy-mobx';

class Controller {

  @observable loading: boolean = true;

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
      {this.controller.loading ? "LOADING!" : "NOT LOADING"}
    </div>;
  }

}
