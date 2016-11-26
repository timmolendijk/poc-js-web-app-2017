export interface Transport<M> {
  list(opts?: { [opt: string]: any }): Promise<ReadonlyArray<M>>;
}

export default Transport;
