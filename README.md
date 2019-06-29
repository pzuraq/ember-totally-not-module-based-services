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
  lookup,
  register,
} from 'ember-totally-not-module-based-services';
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

### `register`

```ts
function register(
  owner: Owner,
  BaseClass: ClassDefinition,
  SubClass: ClassDefinition
): undefined;
```

The `register` function can be used to override a service, like in cases when
you need to provide a different implementation. For instance, if we wanted to
override our `DemoService` from the example above, we could do:

```js
import { register } from 'ember-totally-not-module-based-services';
import DemoService from '../services/demo';

class OverrideService extends DemoService {
  hello = 'galaxy!';
}

export function initialize(appInstance) {
  register(appInstance, DemoService, OverrideService);
}

export default {
  initialize,
};
```

This can also be used in tests to stub out a service:

```js
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { register } from 'ember-totally-not-module-based-services';
import DemoService from 'my-app/services/demo';

module('Acceptance | service', function(hooks) {
  setupApplicationTest(hooks);

  test('test some things', async function(assert) {
    register(
      this.owner,
      DemoService,
      class extends SomeService {
        hello = 'universe!';
      }
    );

    // test some things!
  });
});
```

`register` is restricted to only allow you to register _subclasses_ of the base
class. The reason for this is to prevent confusion, and guide users toward
better programming practices.

### `lookup`

```ts
function lookup(owner: Owner, Class: ClassDefinition): any;
```

`lookup` can be used to lookup the value that is registered under a given class
at any given time. This can be particularly useful if you need to access the
service in tests.

### Structuring and Overriding Services

As mentioned above, `register` is restricted to only allow you to register
_subclasses_ of the base class. The reason for this is to prevent confusion, and
guide users toward better programming practices.

Put another way, it would be pretty strange if you injected one class, and then
received a _completely_ different class that wasn't related to the original in
any way. Typically, when you're overriding a service, the goal is to provide
another services that has the same _methods_ and _properties_, but has somewhat
different behavior. For instance, you may have a `CookieService` which has a few
public methods, like `getValue` and `setValue`:

```js
class CookieService extends Service {
  getValue(key) {
    // get the value from the cookie
  }

  setValue(key, value) {
    // set the value in the cookie
  }
}
```

However, you need two different implementations of this service, one for the
browser, and one for Fastboot on the server! You _could_ create two entirely
separate classes:

```js
class FastbootCookieService extends Service {
  // ...
}

class BrowserCookieService extends Service {
  // ...
}
```

But then we have no way to know that these two services are related. They may
also be able to _share_ some functionality, which would make each class a bit
smaller and easier to manage.

So, when registering a service, the best pattern is to create a common base
class to override. This may mean that each implementation extends the common
class:

```js
import Service from '@ember/service';

// services/cookie.js
export class CookieService extends Service {
  // shared functionality
}

export class FastbootCookieService extends CookieService {
  // fastboot functionality
}

export class BrowserCookieService extends CookieService {
  // browser functionality
}
```

```js
// components/my-component.js
import Component from '@ember/component';
import { service } from 'ember-totally-not-module-based-services';

export default class MyComponent extends Component {
  @service(CookieService) cookie;
}
```

```js
// initializers/cookie
import { register } from 'ember-totally-not-module-based-services';
import {
  CookieService,
  FastbootCookieService,
  BrowserCookieService,
} from '../services/cookie';

class OverrideService extends DemoService {
  hello = 'galaxy!';
}

export function initialize(appInstance) {
  if (isFastboot()) {
    register(appInstance, CookieService, FastbootCookieService);
  } else {
    register(appInstance, CookieService, BrowserCookieService);
  }
}

export default {
  initialize,
};
```

Or, it may make more sense to have a single "main" implementation, with a
subclass that overrides some functionality:

```js
import Service from '@ember/service';

// services/cookie.js
export class CookieService extends Service {
  // main functionality
}

export class FastbootCookieService extends CookieService {
  // fastboot overrides
}
```

```js
// components/my-component.js
import Component from '@ember/component';
import { service } from 'ember-totally-not-module-based-services';

export default class MyComponent extends Component {
  @service(CookieService) cookie;
}
```

```js
// initializers/cookie
import { register } from 'ember-totally-not-module-based-services';
import { CookieService, FastbootCookieService } from '../services/cookie';

class OverrideService extends DemoService {
  hello = 'galaxy!';
}

export function initialize(appInstance) {
  if (isFastboot()) {
    register(appInstance, CookieService, FastbootCookieService);
  }
}

export default {
  initialize,
};
```

Whatever works best for you!

### Extending Services in Tests

The restriction above may seem a bit strict when you're trying to stub out a
service in tests, but remember - when you override a class, you can override
anything you need to. You could, for instance, extend the `CookieService` from
above and completely override both of its public methods:

```js
test('test some things', async function(assert) {
  register(
    this.owner,
    CookieService,
    class extends CookieService {
      getValue() {
        assert.ok(true, 'getValue called!');
      }

      setValue() {
        assert.ok(true, 'setValue called!');
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
