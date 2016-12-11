type AwaitResult = Promise<any> | void;

export interface Awaitable {
  await: AwaitResult;
}

export function isAwaitable(obj): obj is Awaitable {
  return 'await' in (obj as Awaitable);
}

/**
 * Let all operations on call stack execute before reporting state as stable.
 */
export async function awaitEmptyCallStack(promises: Array<Promise<any>>) {
  const result = await Promise.all(promises);
  await new Promise(setTimeout);
  return result;
}

export function awaitAll(awaiting: Array<AwaitResult>): AwaitResult {
  awaiting = awaiting.filter(Boolean);
  if (awaiting.length === 0)
    return;
  return awaitEmptyCallStack(awaiting as Array<Promise<any>>);
}

export function awaitProps(obj: { [prop: string]: any }): AwaitResult {
  const awaiting = Object.keys(obj)
    .map(key => obj[key])
    .filter(isAwaitable)
    .map(value => value.await);
  return awaitAll(awaiting);
}

export default Awaitable;
