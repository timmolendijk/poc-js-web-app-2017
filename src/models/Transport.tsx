export interface ListOptions {
  [opt: string]: any;
}

export interface Transport<M> {
  list(opts?: ListOptions): Promise<ReadonlyArray<M>>;
}

type Operation = 'create' | 'read' | 'update' | 'delete' | 'list';

// TODO(tim): Move the generic part of this logic to `./Error`.

export interface TransportError {
  name: 'TransportError';
  operation: Operation;
}

export function createTransportError(operation: Operation, message: string) {
  return Object.assign(new Error(message), {
    name: 'TransportError',
    operation
  });
}

export function isTransportError(err): err is TransportError {
  return (err as TransportError).name === 'TransportError';
}

export default Transport;
