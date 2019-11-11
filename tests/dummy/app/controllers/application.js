import Controller from '@ember/controller';
import { SomeService, SomeServiceInterface } from '../services/some';

import { service } from 'ember-totally-not-module-based-services';

export default class ApplicationController extends Controller {
  @service(SomeService) some;
  @service(SomeService) same;
  @service(SomeServiceInterface) interface;
}
