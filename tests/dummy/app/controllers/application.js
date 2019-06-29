import Controller from '@ember/controller';
import { AnotherService, SomeService } from '../services/some';

import { service } from 'ember-totally-not-module-based-services';

export default class ApplicationController extends Controller {
  @service(SomeService) some;
  @service(SomeService) same;
  @service(AnotherService) another;
}
