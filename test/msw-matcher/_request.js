'use strict';

const { http } = require('msw');

const { HeadersMatcher, BodyMatcher, URLSearchParamsMatcher } = require('./_matchers');

class Request {
  #scope;
  #options;
  #matchers;
  #times;
  #remaining;

  constructor(scope, options) {
    this.#times = 1;
    this.#remaining = 1;
    this.#scope = scope;
    this.#options = options;
    this.#matchers = [];
  }

  times(times) {
    this.#times = times;
    this.#remaining = times;
    return this;
  }

  matchSearchParams(expectedSearchParams) {
    this.#matchers.push(new URLSearchParamsMatcher(expectedSearchParams));
    return this;
  }

  matchBody(expectedBody) {
    this.#matchers.push(new BodyMatcher(expectedBody));
    return this;
  }

  matchHeaders(expectedHeaders) {
    this.#matchers.push(new HeadersMatcher(expectedHeaders));
    return this;
  }

  handler(fn) {
    const resolver = async (context) => {
      if (this.#remaining > 0) {
        // eslint-disable-next-line no-restricted-syntax
        for (const matcher of this.#matchers) {
          // eslint-disable-next-line no-await-in-loop
          const result = await matcher.match(context);

          if (!result.pass) {
            return null;
          }
        }

        this.#remaining -= 1;

        if (this.#remaining === 0) {
          this.#scope.pendingRequests.delete(this);
        }

        return fn(context);
      }

      return null;
    };

    const url = new URL(this.#options.path, this.#options.baseURL).toString();
    const handler = http[this.#options.method](url, resolver);

    this.#scope.handlers.push(handler);

    return this.#scope;
  }

  describe() {
    return {
      url: new URL(this.#options.path, this.#options.baseURL).toString(),
      method: this.#options.method,
      remaining: this.#remaining,
    };
  }
}

module.exports = { Request };
