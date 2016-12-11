import { EventEmitter } from 'events';

type TypeIdentity = string;

type InstanceIdentity = string | number | InstanceIdentityAsArray | InstanceIdentityAsObject;
// TODO(tim): Omit array format to make distinguishing identity tuple more
// straight-forward? Or, give identity its own proper JavaScript type.
interface InstanceIdentityAsArray {
  [index: number]: InstanceIdentity;
}
interface InstanceIdentityAsObject {
  [hash: string]: InstanceIdentity;
}

export type Identity = [TypeIdentity, InstanceIdentity];

interface NormalizableConstructor {
  new (data?: any, models?: Normalizer): Normalizable;
}

export interface Normalizable {
  id: InstanceIdentity;
  toJSON?(normalized?: boolean): any;
}

// Lookup from type to type identity is by far the most frequent, so let type be
// the key and identity the value.
const registeredTypes = new Map<NormalizableConstructor, TypeIdentity>();

export function registerType(identity: TypeIdentity, Type: NormalizableConstructor) {
  registeredTypes.set(Type, identity);
}

function getType(identity: TypeIdentity) {
  for (const [Type, typeIdentity] of registeredTypes) {
    if (identity === typeIdentity)
      return Type;
  }
}

function getIdentity(instance: Normalizable): Identity {
  // TODO(tim): Can or should this type assertion be prevented?
  return [registeredTypes.get((instance as any).constructor), instance.id];
}

export class Normalizer {

  constructor(data = {}) {
    this.events = new EventEmitter();
    this.events.setMaxListeners(0);

    Object.keys(data).forEach((typeIdentity: TypeIdentity) => {
      data[typeIdentity].forEach((instanceData) => {
        const Type = getType(typeIdentity);
        const instance = new Type(this);
        this.events.emit('data', instance, instanceData);
        this.set(getIdentity(instance), instance);
      });
    });
  }

  private readonly types = new Map<TypeIdentity, Map<InstanceIdentity, Normalizable>>();

  private readonly events;

  onData(instance: Normalizable, handler) {
    this.events.addListener('data', (changedInstance, data) => {
      if (instance === changedInstance)
        handler.call(this, data);
    });
  }

  instance<N extends Normalizable>(identity: Identity): N;
  instance<N extends Normalizable>(Type: NormalizableConstructor, data): N;
  instance<N extends Normalizable>(...args): N {
    if (args.length === 2) {
      const [Type, data] = args;
      let instance = new Type(this) as N;
      this.events.emit('data', instance, data);
      const identity = getIdentity(instance);
      if (this.has(identity))
        instance = this.get<N>(identity);
      this.set(identity, instance, data);
      return instance;
    } else {
      const [identity] = args;
      if (this.has(identity))
        return this.get<N>(identity);
      const [typeIdentity, instanceIdentity] = identity;
      const Type = getType(typeIdentity);
      let instance = new Type(this) as N;
      this.set(identity, instance);
      return instance;
    }
  }

  has([typeIdentity, instanceIdentity]: Identity): boolean {
    return this.types.has(typeIdentity) && this.types.get(typeIdentity).has(instanceIdentity);
  }

  get<N extends Normalizable>([typeIdentity, instanceIdentity]: Identity): N {
    if (this.has([typeIdentity, instanceIdentity]))
      return this.types.get(typeIdentity).get(instanceIdentity) as N;
  }

  private set(identity: Identity, instance: Normalizable, data?) {
    if (!this.has(identity)) {
      const [typeIdentity, instanceIdentity] = identity;
      if (!this.types.has(typeIdentity))
        this.types.set(typeIdentity, new Map<InstanceIdentity, Normalizable>());
      this.types.get(typeIdentity).set(instanceIdentity, instance);
      const originalToJSON = instance.toJSON || function () {
        return this;
      };
      instance.toJSON = function (normalized?: boolean) {
        // TODO(tim): `toJSON` already has an argument, which is an index of
        // some kind or another. We prevent disaster here by strictly checking
        // for not `false` (i.e. not a number), but it still feels rather
        // tricky.
        if (normalized !== false)
          return [typeIdentity, instanceIdentity];
        // If the resulting object preserves a `toJSON` method, it will
        // recursively keep calling it (without preserving our `normalized`
        // argument as `false`) and it will end up always serializing in
        // normalized format.
        const data = Object.assign({}, this);
        delete data.toJSON;
        return originalToJSON.call(data);
      };
    }
    if (data)
      this.events.emit('data', this.get(identity), data);
  }

  toJSON() {
    return [...this.types.entries()].reduce((obj, [typeIdentity, instances]) => {
      obj[typeIdentity] = [...instances.values()].map(instance => {
        return instance.toJSON(false);
      });
      return obj;
    }, {});
  }
  
}

export default Normalizable;
