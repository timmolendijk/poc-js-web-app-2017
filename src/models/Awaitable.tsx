export interface Awaitable {
  await: Promise<any> | void;
}

export function isAwaitable(obj): obj is Awaitable {
  return 'await' in (obj as Awaitable);
}

export async function awaitEmptyCallStack(promises) {
  const result = await Promise.all(promises);
  await new Promise(setTimeout);
  return result;
}

export default Awaitable;
