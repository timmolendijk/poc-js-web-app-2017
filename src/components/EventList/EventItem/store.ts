import { observable, action, expr } from 'mobx';
import { IIdentity, Normalizer } from 'normalize';
import { Event } from 'models';

export default class EventItemStore {

  // TODO(tim): We do not really use all of this as long as we never serialize
  // this object in practice.
  constructor({ expanded = [] }: { expanded?: ReadonlyArray<IIdentity> } = {}, normalize: Normalizer) {
    this.expanded = expanded.map(identity => normalize.get<Event>(identity));
  }

  @observable private readonly expanded: Array<Event>;

  @action expand(event: Event) {
    if (!this.isExpanded(event))
      this.expanded.push(event);
  }

  isExpanded(event: Event): boolean {
    return this.expanded.indexOf(event) !== -1;
  }

}
