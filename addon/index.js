import { DEBUG } from '@glimmer/env';
import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';
import { computed } from '@ember/object';

import {
  setServiceInterface,
  getServiceInterfaceFor,
  getServiceName,
  getClassName
} from './-private';

export function service(Class) {
  if (DEBUG) {
    let InterfaceClass = getServiceInterfaceFor(Class);

    assert(`You attempted to inject ${getClassName(Class)}, but it is an implementation of the ${getClassName(InterfaceClass)} service interface. Service interfaces are a way to define a contract that an implementation can fulfill, and you must inject the interface instead: @service(${getClassName(InterfaceClass)}). To find out more about service interfaces, check out the docs: https://github.com/pzuraq/ember-totally-not-module-based-services#service-interfaces`, !InterfaceClass);
  }

  let serviceName = getServiceName(Class);

  return computed({
    get() {
      let owner = getOwner(this);
      let serviceInstance = owner.lookup(serviceName);

      if (serviceInstance === undefined) {
        owner.register(serviceName, Class);
        serviceInstance = owner.lookup(serviceName);
      }

      return serviceInstance;
    },
  });
}

export function serviceInterface(Class) {
  if (DEBUG) {
    let InterfaceClass = getServiceInterfaceFor(Class);

    assert(`You attempted to decorate ${getClassName(Class)} as a service interface, but it is an implementation of a service interface: ${getClassName(InterfaceClass)}.`, !InterfaceClass);
  }

  setServiceInterface(Class);

  return Class;
}

export function lookup(owner, Class) {
  return owner.lookup(getServiceName(Class));
}
