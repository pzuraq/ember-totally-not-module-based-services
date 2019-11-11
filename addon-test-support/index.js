import { getServiceName } from 'ember-totally-not-module-based-services/-private';

export function registerMockService(owner, ServiceClass, MockClass) {
  owner.register(getServiceName(ServiceClass), MockClass);
}
