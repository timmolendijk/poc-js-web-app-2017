import { Awaitable, isAwaitable, awaitEmptyCallStack } from './Awaitable';

export interface StateFields {}

export class State implements Awaitable {

  constructor(data?) {
    this.data = data || { };
  }

  private readonly data: { [raw: string]: any };

  readonly fields: StateFields = { };

  add(key: string, value: Function): StateFields {
    if (!(key in this.fields))
      this.fields[key] = value(this.data[key]);
    return this.fields;
  }

  get await() {
    const awaiting = Object.keys(this.fields)
      .map(key => this.fields[key])
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
    return this.fields;
  }

}

export default State;
