import { observable, action } from 'mobx';

import { Identity, Normalizer } from 'Normalizable';
import { Member } from 'models';

export class AttendeeItemStore {

  @observable name: string = null;

  @observable private _editing: Member = null;
  get editing() {
    return this._editing;
  }

  @action startEdit(attendee: Member) {
    this._editing = attendee;
    this.name = attendee.name;
  }
  @action endEdit() {
    this._editing = null;
    this.name = null;
  }

}

export default AttendeeItemStore;
