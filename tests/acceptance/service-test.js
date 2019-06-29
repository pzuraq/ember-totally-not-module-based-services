import { module, test } from 'qunit';
import { find, visit, settled } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { lookup, register } from 'ember-totally-not-module-based-services';
import { SomeService } from 'dummy/services/some';

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
      find('[data-test-another-value]').textContent,
      789,
      'dependency overridden correctly'
    );
  });

  test('can override a service in tests', async function(assert) {
    register(
      this.owner,
      SomeService,
      class extends SomeService {
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

  test('throws an error if you try to register a class to itself', async function(assert) {
    assert.throws(() => {
      register(this.owner, SomeService, SomeService);
    }, /Attempted to register SomeService as itself, which is not necessary. An instance of the class will be created, no need to register it./);
  });

  test('throws an error if you try to register a class that is not a subclass', async function(assert) {
    assert.throws(() => {
      register(this.owner, SomeService, class ADifferentClass {});
    }, /Attempted to register ADifferentClass in place of SomeService, but it is not a subclass of the injection/);
  });

  test('throws an error if you try to override a class with a subclass that has already been registered/used', async function(assert) {
    assert.throws(() => {
      class Foo extends SomeService {}
      class Bar extends Foo {}

      register(this.owner, Foo, Bar);
      register(this.owner, SomeService, Bar);
    }, /Attempted to register Bar in place of SomeService, but Bar was already registered as its own service, or in place of another service./);
  });
});
