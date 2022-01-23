import * as methods from './methods'

addEventListener("fetch", (event) => {
  event.respondWith(handle(event.request));
});

async function handle(request) {
  // handle CORS pre-flight request
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // redirect GET requests to the OAuth login page on github.com
  if (request.method === "GET") {
    switch (new URL(request.url).pathname) {
      case '/auth':
        return methods.auth(request);
      case '/callback':
        return methods.callback(request);
      default:
        return new Response(null, { status: 404 });
    }
  }
}
