import { register } from 'ember-totally-not-module-based-services';
import { AnotherService, OverrideService } from '../services/some';

export function initialize(appInstance) {
  register(appInstance, AnotherService, OverrideService);
}

export default {
  initialize,
};
