'use strict';

const { Request } = require('./_request');

class Scope {
  #baseURL;

  constructor(baseURL) {
    this.#baseURL = baseURL;
    this.handlers = [];
    this.pendingRequests = new Set();
  }

  #request(method, path) {
    const request = new Request(this, {
      baseURL: this.#baseURL,
      method,
      path,
    });

    this.pendingRequests.add(request);

    return request;
  }

  get(path) {
    return this.#request('get', path);
  }

  post(path) {
    return this.#request('post', path);
  }

  put(path) {
    return this.#request('put', path);
  }

  delete(path) {
    return this.#request('delete', path);
  }

  done() {
    if (this.pendingRequests.size > 0) {
      const descriptions = Array.from(this.pendingRequests, (request) => request.describe());
      throw new Error(`Pending request queue is not empty. The following requests were not consumed:
        ${JSON.stringify(descriptions, null, 2)}
        `);
    }
  }
}

module.exports = { Scope };
