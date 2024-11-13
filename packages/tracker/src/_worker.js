export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Add CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/javascript'
    };

    // Handle OPTIONS request
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    // Serve the tracker.js file
    if (url.pathname === '/tracker.js') {
      const response = await fetch(new URL('./tracker.js', import.meta.url));
      const script = await response.text();
      return new Response(script, { headers });
    }

    return new Response('Not found', { status: 404 });
  }
}; 