export function generateScript(websiteId: string) {
  return `<script>
  (function(d, w) {
    w._r = w._r || {
      websiteId: "${websiteId}"
    };
    var s = d.createElement('script');
    s.async = true;
    s.src = 'https://493117db.session-recorder-tracker.pages.dev/tracker.js';
    d.head.appendChild(s);
  })(document, window);
  </script>`;
  }
  