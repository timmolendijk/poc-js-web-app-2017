import { observable, action } from 'mobx';

import { Identity, Normalizer } from 'Normalizable';
import { Event } from 'models';

export class EventStore {

  constructor({ expanded = [] }: { expanded?: ReadonlyArray<Identity> } = {}, normalize: Normalizer) {
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
