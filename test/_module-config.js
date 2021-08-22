import Hoek from '@hapi/hoek';
import Config from '../lib/config.js';

const baseConfig = {
  client: {
    id: 'the client id',
    secret: 'the client secret',
  },
  auth: {
    tokenHost: 'https://authorization-server.org',
  },
};

export function createModuleConfig(config = {}) {
  return Hoek.applyToDefaults(baseConfig, config);
}

export function createModuleConfigWithDefaults(config) {
  return Config.apply(createModuleConfig(config));
}
