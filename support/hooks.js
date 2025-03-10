'use strict';

const
  { After, Before, BeforeAll } = require('cucumber'),
  testMappings = require('../fixtures/mappings'),
  testSecurities = require('../fixtures/securities'),
  testFixtures = require('../fixtures/fixtures'),
  World = require('./world');

// Common hooks ================================================================

BeforeAll(({ timeout: 10 * 1000 }), async function () {
  const world = new World({});

  console.log(`Start tests with ${world.protocol.toLocaleUpperCase()} protocol.`);

  await world.sdk.connect();

  console.log('Loading default securities..');

  await world.sdk.query({
    controller: 'admin',
    action: 'loadSecurities',
    body: testSecurities,
    refresh: 'wait_for'
  });

  world.sdk.disconnect();
});

Before(({ timeout: 10 * 1000 }), async function () {
  await this.sdk.connect();

  await this.sdk.auth.login(
    'local',
    { username: 'test-admin', password: 'password' });

  await this.sdk.query({
    controller: 'admin',
    action: 'resetDatabase',
    refresh: 'wait_for'
  });
});

After(async function () {
  // Clean values stored by the scenario
  this.props = {};

  if (this.sdk && typeof this.sdk.disconnect === 'function') {
    this.sdk.disconnect();
  }
});

// security hooks ==============================================================

Before({ tags: '@security', timeout: 60 * 1000 }, async function () {
  await this.sdk.query({
    controller: 'admin',
    action: 'resetSecurity',
    refresh: 'wait_for'
  });

  this.sdk.jwt = null;

  await this.sdk.query({
    controller: 'admin',
    action: 'loadSecurities',
    body: testSecurities,
    refresh: 'wait_for'
  });

  await this.sdk.auth.login(
    'local',
    { username: 'test-admin', password: 'password' });
});

// mappings hooks ==============================================================

Before({ tags: '@mappings' }, async function () {
  await this.sdk.query({
    controller: 'admin',
    action: 'loadMappings',
    body: testMappings,
    refresh: 'wait_for'
  });

  await this.sdk.query({
    controller: 'admin',
    action: 'loadFixtures',
    body: testFixtures,
    refresh: 'wait_for'
  });
});
