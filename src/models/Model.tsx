import { curry } from 'lodash';

export interface Model {}

export class ModelRegistry {

  constructor(data?) {
    
  }

  readonly instance = curry(<M extends Model>(Type, data): M =>
    new Type(data)
  );

}

export default Model;
