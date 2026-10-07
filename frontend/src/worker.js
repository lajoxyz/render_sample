export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api' && !url.pathname.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }
    if (request.method !== 'GET') {
      return new Response('Method not allowed', {
        status: 405, headers: { Allow: 'GET' },
      });
    }
    const path = url.pathname.slice(4) || '/';
    // Only expose the two public sample endpoints, not an arbitrary proxy.
    if (path !== '/' && path !== '/health') {
      return new Response('Not found', { status: 404 });
    }
    try {
      const upstream = await fetch(`${env.API_BASE_URL}${path}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(90000),
      });
      return new Response(upstream.body, {
        status: upstream.status,
        headers: {
          'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
          'Cache-Control': 'no-store',
        },
      });
    } catch {
      return Response.json({ error: 'API unavailable. Please try again shortly.' }, {
        status: 502,
      });
    }
  },
};
