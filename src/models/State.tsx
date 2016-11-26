import { Awaitable, awaitProps } from './Awaitable';

export interface Stores {
  add<T>(key: string, define: (data) => T): T;
}

class StateStores implements Stores {

  constructor(data?) {
    data = data || { };
    this.add = (key, define) => {
      if (!(key in this))
        this[key] = define(data[key]);
      return this[key];
    };
  }

  add: <T>(key: string, define: (data) => T) => T;

}

export class State implements Awaitable {

  constructor(data?) {
    // Separate stores from the state to allow other components to augment the
    // `Stores` interface and be certain that no name clashes will occur.
    this.stores = new StateStores(data);
  }

  readonly stores: StateStores;

  get await() {
    return awaitProps(this.stores);
  }

  toJSON() {
    return this.stores;
  }

}

export default State;
