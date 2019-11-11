import { assert } from '@ember/debug';
import { DEBUG } from '@glimmer/env';

export let isServiceInterface;
export let setServiceInterface;
export let getServiceInterfaceFor;

if (DEBUG) {
  let SERVICES_INTERFACES = new WeakSet();

  isServiceInterface = (Class) => {
    return SERVICES_INTERFACES.has(Class);
  };

  setServiceInterface = (Class) => {
    SERVICES_INTERFACES.add(Class);
  };

  getServiceInterfaceFor = (Class) => {
    let current = Object.getPrototypeOf(Class);

    while (current !== null) {
      if (SERVICES_INTERFACES.has(current)) {
        return current;
      }

      current = Object.getPrototypeOf(current);
    }
  }
}

const NONCE = Math.random()
  .toString(36)
  .substring(2);

export function getClassName(Class) {
  return (
    Class.name || (Class.toString().match(/function (.+?)\(/) || ['', ''])[1]
  );
}

export function getServiceName(Class) {
  let className = getClassName(Class);

  return `service:totally-not-modules_${className}_${NONCE}`;
}

export function registerService(owner, InterfaceClass, ImplClass) {
  assert(`${getClassName(InterfaceClass)} isn't a service interface. Classes you attempt to override must be interfaces. Interfaces represent a contract that an implementation can fulfill, and must be decorated with the @serviceInterface decorator. Implementations can then be registered in place of the interface. To find out more about service interfaces, check out the docs: https://github.com/pzuraq/ember-totally-not-module-based-services#service-interfaces`, isServiceInterface(InterfaceClass));

  assert(`${getClassName(ImplClass)} isn't a subclass of ${getClassName(InterfaceClass)}. Implementations of an interface must be subclasses of the interface.`, ImplClass.prototype instanceof InterfaceClass);

  owner.register(getServiceName(InterfaceClass), ImplClass);
}
