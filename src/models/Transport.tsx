export interface Transport<M> {
  list(): Promise<ReadonlyArray<M>>;
}

export default Transport;
