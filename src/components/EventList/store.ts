import { observable, computed } from 'mobx';
import { reportOnError } from 'error';
import { ITransport, isTransportError } from 'transport';
import * as Mescy from 'mescy';
import { Event } from 'models';

interface IProps {
  events: Array<Mescy.IReference>;
  loading: boolean;
}

export default class EventListStore {

  static defaultProps: IProps = {
    events: [],
    loading: false
  };

  constructor(readonly state: Mescy.Container) {}

  private readonly _props = Object.assign({}, (this.constructor as any).defaultProps);
  private get props(): IProps {
    return this.state.getProps(this) || this._props;
  }

  @computed get events(): ReadonlyArray<Event> {
    if (!this.props.events.length && !this.props.loading)
      setTimeout(() => reportOnError(this.load()));
    return this.props.events.map(ref => {
      return this.state.getComponent(ref) as Event;
    });
  }

  @computed get loading() {
    return this.props.loading;
  }

  private async load() {
    this.startLoad();
    const transport: ITransport<Event> = new Event.Transport;
    const page = transport.list();
    let instances;
    try {
      instances = await page;
    } catch (err) {
      console.log(err);
      if (isTransportError(err))
        return;
      throw err;
    }
    this.endLoad(instances);
  }

  // TODO(tim): ??
  // private startLoad2 = this.state.makeAction(() => {
  //   this.props.loading = true;
  // });

  @Mescy.action private startLoad() {
    this.props.loading = true;
  }
  @Mescy.action private endLoad(events: ReadonlyArray<Event>) {
    this.props.events = events.map(event => this.state.persistComponent(event));
    this.props.loading = false;
  }

}

Mescy.registerType(EventListStore);
