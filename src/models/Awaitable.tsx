export interface Awaitable {
  await: Promise<any> | void;
}

export function isAwaitable(obj): obj is Awaitable {
  return 'await' in (obj as Awaitable);
}

export default Awaitable;
