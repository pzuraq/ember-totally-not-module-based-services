import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

import { SomeServiceInterface, SomeServiceImplementation } from './services/some';

class App extends Application {
  Resolver = Resolver;

  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;

  serviceOverrides = [
    [SomeServiceInterface, SomeServiceImplementation],
  ];
}

loadInitializers(App, config.modulePrefix);

export default App;
