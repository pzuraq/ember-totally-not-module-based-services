import { registerService } from 'ember-totally-not-module-based-services/-private';

export function initialize(appInstance) {
  let overrides = appInstance.base.serviceOverrides || [];

  overrides.forEach(([InterfaceClass, ImplClass]) => {
    registerService(appInstance, InterfaceClass, ImplClass);
  });
}

export default {
  initialize,
};
