import { DEBUG } from '@glimmer/env';
import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';
import { computed } from '@ember/object';

let REGISTERED_SERVICES;
let getRegisteredServicesFor;

if (DEBUG) {
  REGISTERED_SERVICES = new WeakMap();

  getRegisteredServicesFor = function(owner) {
    let registeredServices = REGISTERED_SERVICES.get(owner);

    if (registeredServices === undefined) {
      registeredServices = new WeakSet();
      REGISTERED_SERVICES.set(owner, registeredServices);
    }

    return registeredServices;
  };
}

const NONCE = Math.random()
  .toString(36)
  .substring(2);

function getClassName(Class) {
  return (
    Class.name || (Class.toString().match(/function (.+?)\(/) || ['', ''])[1]
  );
}

function getServiceName(Class) {
  let className = getClassName(Class);

  return `service:totally-not-modules_${className}_${NONCE}`;
}

export function service(Class) {
  let serviceName = getServiceName(Class);

  return computed({
    get() {
      let owner = getOwner(this);
      let serviceInstance = owner.lookup(serviceName);

      if (serviceInstance === undefined) {
        if (DEBUG) {
          getRegisteredServicesFor(owner).add(Class);
        }
        owner.register(serviceName, Class);
        serviceInstance = owner.lookup(serviceName);
      }

      return serviceInstance;
    },
  });
}

export function lookup(owner, Class) {
  return owner.lookup(getServiceName(Class));
}

export function register(owner, BaseClass, SubClass) {
  assert(
    `Attempted to register ${getClassName(
      BaseClass
    )} as itself, which is not necessary. An instance of the class will be created, no need to register it.`,
    SubClass !== BaseClass
  );

  assert(
    `Attempted to register ${getClassName(SubClass)} in place of ${getClassName(
      BaseClass
    )}, but it is not a subclass of the injection. When you want to override an injected class, you must provide a subclass of that class instead. This restriction is put in place to prevent confusion, since registering a completely unrelated class may be counter-intuitive. If you have two separate implementations of a class, you should create a single base class that they extend from. If you attempting to stub the class for tests, you can extend it directly and stub the public API methods that it exposes.`,
    SubClass.prototype instanceof BaseClass
  );

  assert(
    `Attempted to register ${getClassName(SubClass)} in place of ${getClassName(
      BaseClass
    )}, but ${getClassName(
      SubClass
    )} was already registered as its own service, or in place of another service. You may have injected it directly into a class when you meant to inject the ${getClassName(
      BaseClass
    )} base class instead.`,
    !getRegisteredServicesFor(owner).has(SubClass)
  );

  if (DEBUG) {
    getRegisteredServicesFor(owner).add(BaseClass);
    getRegisteredServicesFor(owner).add(SubClass);
  }

  owner.register(getServiceName(BaseClass), SubClass);
}
