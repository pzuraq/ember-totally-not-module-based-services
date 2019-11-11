# ember-totally-not-module-based-services

This experimental addon implements the [Explicit Service Injection
RFC](https://github.com/emberjs/rfcs/pull/502) for the purpose of exploring the
API and its design space with a real, working implementation.

```js
// components/my-component.js
import Component from '@ember/component';
import Service from '@ember/service';
import { service } from 'ember-totally-not-module-based-services';

class DemoService extends Service {
  hello = 'world!';
}

export default class MyComponent extends Component {
  @service(DemoService) demo;
}
```

### Why the long name?

As mentioned above, this addon is _experimental_, based on an RFC that is still
going through the RFC process. There is no guarantee that it will be accepted,
and community members have both come out strongly in favor and strongly opposed
to this type of API. The purpose of this addon is to allow people to try out the
APIs directly, so we aren't basing our discussion purely on theoretical designs.

As such, the long-and-goofy name is meant to be a small deterrent, in the same
vein as the [batman-template addon](https://github.com/rwjblue/ember-holy-futuristic-template-namespacing-batman),
if you're thinking about using this in your large, production application that
sticks to LTS releases only. If you want to stick with best practices, keep
using services the way you always have.

If you're working on a side-project, or experimenting, however, this addon is
based entirely on public Ember APIs, and thus has the same stability guarantees
as Ember.

## Compatibility

- Ember.js v2.18 or above
- Ember CLI v2.13 or above
- Node.js v8 or above

## Installation

```
ember install ember-totally-not-module-based-services
```

## Usage

This addon contains 3 exports:

```js
import {
  service,
  serviceInterface,
  lookup,
} from 'ember-totally-not-module-based-services';
```

In addition, it exports a test helper for registering mock services in tests:

```js
import {
  registerMockService
} from 'ember-totally-not-module-based-services/test-support';
```

### `service`

```ts
function service(Class: ClassDefinition): Decorator;
```

Receives a class as its first argument, and injects an instance of that class:

```js
// services/demo.js
import Service from '@ember/service';

export default class DemoService extends Service {
  hello = 'world!';
}
```

```js
// components/my-component.js
import Component from '@ember/component';
import DemoService from '../services/demo';
import { service } from 'ember-totally-not-module-based-services';

export default class MyComponent extends Component {
  @service(DemoService) demo;
}
```

The class must extend from Ember's `Service` class currently. Like standard
string based service injections, this service will be a singleton, and will be
shared anywhere it is injected.

### `@serviceInterface`

Usually, services only have a single implementation. Sometimes however, services
are meant to define an _interface_ instead. For instance, you could define a
standardized data store that exposes the same API to users, but has different
implementations for different types of APIs - JSON API and GraphQL:

```js
import { serviceInterface } from 'ember-totally-not-module-based-services';

@serviceInterface
export class Store extends Service {
  // returns a model containing the data
  loadData() {}
}

export class JsonApiStore extends Store {
  loadData() {
    // Load JSON API data and convert it into a model
  }
}

export class GraphQlStore extends Store {
  loadData() {
    // Load GraphQL data and convert into a model
  }
}
```

Now, users of the Store can inject it into their classes, without needing to
know the details of how the store is implemented:

```js
export class MyComponent extends Component {
  @service(Store) store;
}
```

And the user can then override the service in their application definition,
choosing the service they want to actually use.

```js
// app/app.js
class App extends Application {
  serviceOverrides = [
    [Store, JsonApiStore],
  ];
}
```

The JSON API and GraphQL implementations can then be swapped out under the hood
as an implementation detail. This keeps the _users_ of the store more flexible,
and is especially useful for addons and ecosystems of components.

### `lookup`

```ts
function lookup(owner: Owner, Class: ClassDefinition): any;
```

`lookup` can be used to lookup the value that is registered under a given class
at any given time. This can be particularly useful if you need to access the
service in tests.

### Mocking Services in Tests

You can mock a service with any replacement class in tests using the
`registerMockService` function.

```js
import { registerMockService } from 'ember-totally-not-module-based-services/test-support';

test('test some things', async function(assert) {
  registerMockService(
    this.owner,
    Store,
    class  {
      loadData() {
        assert.ok(true, 'store data loaded');
      }
    }
  );

  // test some things!
});
```

You can either fully stub out your service just for tests, are you can stub out
the public APIs you care about on a case-by-case basis. This also allows you to
test any behavior in the service that you care about by only stubbing out some
of the methods of properties.

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
