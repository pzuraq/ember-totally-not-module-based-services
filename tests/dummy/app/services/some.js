import Service from '@ember/service';
import { serviceInterface } from 'ember-totally-not-module-based-services';

export class SomeService extends Service {
  value = 123;
}

@serviceInterface
export class SomeServiceInterface extends Service {
  value = 456;
}

export class SomeServiceImplementation extends SomeServiceInterface {
  value = 789;
}
