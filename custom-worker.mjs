import handler from './.open-next/worker.js';

export default {
  async fetch(request, env, ctx) {
    const response = await handler.fetch(request, env, ctx);

    // Next.js sets `Cache-Control: private, no-cache, no-store` on dynamic HTML routes,
    // which disables browser back/forward cache (bfcache). Replace `no-store` on public
    // GET HTML responses with short edge/browser caching so bfcache works while fresh
    // scraped jobs still appear within minutes.
    const contentType = response.headers.get('content-type') || '';
    const cacheControl = response.headers.get('cache-control') || '';
    if (
      request.method === 'GET' &&
      response.status === 200 &&
      contentType.includes('text/html') &&
      cacheControl.includes('no-store')
    ) {
      const headers = new Headers(response.headers);
      headers.set('cache-control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=60');
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return response;
  },
};
