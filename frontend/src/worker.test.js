import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.js';

const env = { API_BASE_URL: 'https://backend.example', ASSETS: {
  fetch: async () => new Response('frontend'),
} };

test('serves frontend assets', async () => {
  const response = await worker.fetch(new Request('https://frontend.example/'), env);
  assert.equal(await response.text(), 'frontend');
});

test('rejects unknown API paths and write methods', async () => {
  assert.equal((await worker.fetch(new Request('https://frontend.example/api/unknown'), env)).status, 404);
  assert.equal((await worker.fetch(new Request('https://frontend.example/api/', { method: 'POST' }), env)).status, 405);
});

test('proxies API requests and handles upstream failures', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url) => {
      assert.equal(url, 'https://backend.example/');
      return Response.json({ message: 'Hello, world!' });
    };
    const response = await worker.fetch(new Request('https://frontend.example/api/'), env);
    assert.deepEqual(await response.json(), { message: 'Hello, world!' });
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    globalThis.fetch = async () => { throw new Error('offline'); };
    assert.equal((await worker.fetch(new Request('https://frontend.example/api/health'), env)).status, 502);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
