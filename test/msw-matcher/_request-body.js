'use strict';

const bodies = new WeakMap();

const CONTENT_TYPE = 'content-type';

const JSON_CONTENT_TYPE = 'application/json';
const FORM_CONTENT_TYPE = 'application/x-www-form-urlencoded';

function readJSON(request) {
  return request.json();
}

async function readForm(request) {
  return Object.fromEntries(await request.formData());
}

const readers = {
  [JSON_CONTENT_TYPE]: readJSON,
  [FORM_CONTENT_TYPE]: readForm,
};

const readBody = async (request) => {
  const contentType = request.headers.get(CONTENT_TYPE);

  if (readers[contentType]) {
    const read = readers[contentType];
    const body = bodies.get(request) ?? await read(request);

    bodies.set(request, body);

    return body;
  }

  return null;
};

module.exports = { readBody };
