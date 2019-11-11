import { module, test } from 'qunit';
import Service from '@ember/service';
import { find, visit, settled } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import { lookup, service, serviceInterface } from 'ember-totally-not-module-based-services';
import { registerService } from 'ember-totally-not-module-based-services/-private';
import { registerMockService } from 'ember-totally-not-module-based-services/test-support';

import { SomeService, SomeServiceInterface, SomeServiceImplementation } from 'dummy/services/some';

module('Acceptance | service', function(hooks) {
  setupApplicationTest(hooks);

  test('basic', async function(assert) {
    await visit('/');

    assert.equal(
      find('[data-test-some-value]').textContent,
      123,
      'dependency injected correctly'
    );

    assert.equal(
      find('[data-test-same-value]').textContent,
      123,
      'dependency injected correctly'
    );

    assert.equal(
      find('[data-test-interface-value]').textContent,
      789,
      'dependency overridden correctly'
    );
  });

  test('can override a service interface with register if the service is a subclass', async function(assert) {
    registerService(
      this.owner,
      SomeServiceInterface,
      class extends SomeServiceInterface {
        value = 456;
      }
    );

    await visit('/');

    assert.equal(
      find('[data-test-interface-value]').textContent,
      456,
      'dependency injected correctly'
    );
  });

  test('can override a service with registerMockService with any service', async function(assert) {
    registerMockService(
      this.owner,
      SomeService,
      class extends Service {
        value = 456;
      }
    );

    await visit('/');

    assert.equal(
      find('[data-test-some-value]').textContent,
      456,
      'dependency injected correctly'
    );

    assert.equal(
      find('[data-test-same-value]').textContent,
      456,
      'dependency injected correctly'
    );
  });

  test('can override a service interface with registerMockService with any service', async function(assert) {
    registerMockService(
      this.owner,
      SomeServiceInterface,
      class extends Service {
        value = 456;
      }
    );

    await visit('/');

    assert.equal(
      find('[data-test-interface-value]').textContent,
      456,
      'dependency injected correctly'
    );
  });

  test('services are singletons', async function(assert) {
    await visit('/');

    assert.equal(
      find('[data-test-some-value]').textContent,
      123,
      'dependency injected correctly'
    );

    assert.equal(
      find('[data-test-same-value]').textContent,
      123,
      'dependency injected correctly'
    );

    lookup(this.owner, SomeService).set('value', 456);
    await settled();

    assert.equal(
      find('[data-test-some-value]').textContent,
      456,
      'dependency updated correctly'
    );

    assert.equal(
      find('[data-test-same-value]').textContent,
      456,
      'dependency updated correctly'
    );
  });

  test('throws an error if you try to register to a class that is not an interface', async function(assert) {
    assert.throws(() => {
      registerService(this.owner, class Foo {}, class Bar {});
    }, /Assertion Failed: Foo isn't a service interface. Classes you attempt to override must be interfaces./);
  });

  test('throws an error if you try to register a class that is not a subclass', async function(assert) {
    assert.throws(() => {
      registerService(this.owner, SomeServiceInterface, class ADifferentClass {});
    }, /Assertion Failed: ADifferentClass isn't a subclass of SomeServiceInterface. Implementations of an interface must be subclasses of the interface./);
  });

  test('throws an error if you try to register an interface to itself', async function(assert) {
    assert.throws(() => {
      registerService(this.owner, SomeServiceInterface, SomeServiceInterface);
    }, /Assertion Failed: SomeServiceInterface isn't a subclass of SomeServiceInterface. Implementations of an interface must be subclasses of the interface./);
  });

  test('throws an error if you try to inject a service interface implemenation', async function(assert) {
    assert.throws(() => {
      class Foo {
        @service(SomeServiceImplementation) some;
      }

      new Foo();
    }, /Assertion Failed: You attempted to inject SomeServiceImplementation, but it is an implementation of the SomeServiceInterface service interface./);
  });

  test('throws an error if you try to decorate a class that is an implementation of a service interface', async function(assert) {
    assert.throws(() => {
      @serviceInterface
      class Foo extends SomeServiceInterface {}

      new Foo();
    }, /Assertion Failed: You attempted to decorate Foo as a service interface, but it is an implementation of a service interface: SomeServiceInterface./);
  });
});
