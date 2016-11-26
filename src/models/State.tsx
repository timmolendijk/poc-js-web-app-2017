import { Awaitable, isAwaitable, awaitEmptyCallStack } from './Awaitable';

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
    const awaiting = Object.keys(this.stores)
      .map(key => this.stores[key])
      .filter(isAwaitable)
      .map(value => value.await)
      .filter(Boolean);
    
    if (awaiting.length === 0)
      return;
    
    // Let all operations on call stack execute before reporting state as
    // stable.
    return awaitEmptyCallStack(awaiting);
  }

  toJSON() {
    return this.stores;
  }

}

export default State;
