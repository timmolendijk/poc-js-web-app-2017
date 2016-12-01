type TypeIdentity = string;

type InstanceIdentity = string | number | InstanceIdentityAsArray | InstanceIdentityAsObject;
interface InstanceIdentityAsArray {
  [index: number]: InstanceIdentity;
}
interface InstanceIdentityAsObject {
  [hash: string]: InstanceIdentity;
}

export type Identity = [TypeIdentity, InstanceIdentity];

interface NormalizableConstructor {
  new (...any): Normalizable;
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

function identity(instance: Normalizable): Identity {
  // TODO(tim): Can or should this type assertion be prevented?
  return [registeredTypes.get((instance as any).constructor), instance.id];
}

export class Registry {

  constructor(data = {}) {
    Object.keys(data).forEach((typeIdentity: TypeIdentity) => {
      data[typeIdentity].forEach((instanceData) => {
        this.set(new (getType(typeIdentity))(instanceData, this));
      });
    });
  }

  private readonly types = new Map<TypeIdentity, Map<InstanceIdentity, Normalizable>>();

  has([typeIdentity, instanceIdentity]: Identity): boolean {
    return this.types.has(typeIdentity) && this.types.get(typeIdentity).has(instanceIdentity);
  }

  // TODO(tim): It may be useful if a reference to an instance does not depend
  // on that instance already existing in the registry. It is also not strictly
  // necessary, as long as the corresponding type can handle instances that only
  // have an id, and they have a setter for id. In that case we can simply
  // create an instance as soon as we find a reference to it, and then its data
  // can be updated later when it comes in.
  get<N extends Normalizable>([typeIdentity, instanceIdentity]: Identity): N {
    if (this.has([typeIdentity, instanceIdentity]))
      return this.types.get(typeIdentity).get(instanceIdentity) as N;
  }

  private set(instance: Normalizable) {
    const [typeIdentity, instanceIdentity] = identity(instance);
    if (!this.types.has(typeIdentity))
      this.types.set(typeIdentity, new Map<InstanceIdentity, Normalizable>());
    const originalToJSON = instance.toJSON || function () {
      return this;
    };
    instance.toJSON = function (normalized?: boolean) {
      // TODO(tim): `toJSON` already has an argument, which is an index of some
      // kind or another. We prevent disaster here by strictly checking for not
      // `false` (i.e. not a number), but it still feels rather tricky.
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
    this.types.get(typeIdentity).set(instanceIdentity, instance);
  }

  normalize<N extends Normalizable>(instance: N): N {
    const id = identity(instance);
    if (this.has(id))
      instance = this.get<N>(id);
    else
      this.set(instance);
    return instance;
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
