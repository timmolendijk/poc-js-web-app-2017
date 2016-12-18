import * as React from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { injectStore } from 'state'
import { Member } from 'models';
import Store from './store';

interface IProps {
  member: Member;
  store?: Store;
}

const withStore = injectStore<IProps>(
  (data, stores) => new Store()
);

class AttendeeItem extends React.Component<IProps, {}> {

  @computed get editing() {
    return this.props.store.editing === this.props.member;
  }

  onEdit = () => {
    this.props.store.startEdit(this.props.member);
  };

  onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO(tim): Any benefit if we put these two mutations together in a single
    // action?
    this.props.member.name = this.props.store.name;
    this.props.store.endEdit();
  };

  onChangeName = (e: React.SyntheticEvent<HTMLInputElement>) => {
    this.props.store.name = e.currentTarget.value;
  };

  render() {
    const { member, store } = this.props;

    if (this.editing)
      return <form onSubmit={this.onSubmit}>
        <input type="text" value={store.name} onChange={this.onChangeName} autoFocus={true} />
        <button type="submit">Save</button>
      </form>;

    return <div>
      <a href={member.profile} target="_blank">{member.name}</a>
      &nbsp;
      <button type="button" onClick={this.onEdit}>edit</button>
    </div>;
  }

}

export default withStore(observer(AttendeeItem));
