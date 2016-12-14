import * as React from 'react';

export interface Props {
  name: string;
  profileUrl: string;
  editing: boolean;
  onEdit(): void;
  onName(value: string): void;
  onSave(): void;
}

export function AttendeeItem({ name, profileUrl, editing, onEdit, onName, onSave }: Props) {

  if (editing)
    return <form onSubmit={onSubmit}>
      <input type="text" value={name} onChange={onChangeName} autoFocus={true} />
      <button type="submit">Save</button>
    </form>;

  // TODO(tim): Does the fact that these functions are passed as attribute to
  // components (`form` and `input`), while being newly created upon every
  // render have any negative implications?

  function onChangeName(e: React.SyntheticEvent<HTMLInputElement>) {
    onName(e.currentTarget.value);
  }
  function onSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    onSave();
  }

  return <div>
    <a href={profileUrl} target="_blank">{name}</a>
    &nbsp;
    <button type="button" onClick={onEdit}>edit</button>
  </div>;

}
