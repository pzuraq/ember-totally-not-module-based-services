import Service from '@ember/service';

export class SomeService extends Service {
  value = 123;
}

export class AnotherService extends Service {
  value = 456;
}

export class OverrideService extends AnotherService {
  value = 789;
}
