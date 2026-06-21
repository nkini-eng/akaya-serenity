#!/usr/bin/env python3
"""Local dev server that mimics GitHub Pages' custom 404 behavior.

The built-in `python3 -m http.server` returns its own plain error page for
missing files, so it cannot be used to preview `404.html`. This server serves
the site's `404.html` (with a real HTTP 404 status) whenever a path is missing,
matching how GitHub Pages / Netlify / Vercel behave in production.

Usage (from the project root):

    python3 tools/serve.py            # serves on http://localhost:8000
    python3 tools/serve.py 8080       # custom port
"""

import os
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class PagesHandler(SimpleHTTPRequestHandler):
    def send_error(self, code, message=None, explain=None):
        # For missing pages, serve the site's branded 404.html with a 404 status.
        if code == 404:
            page = os.path.join(ROOT, "404.html")
            if os.path.exists(page):
                with open(page, "rb") as fh:
                    body = fh.read()
                self.send_response(404)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                if self.command != "HEAD":
                    self.wfile.write(body)
                return
        super().send_error(code, message, explain)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    handler = partial(PagesHandler, directory=ROOT)
    with ThreadingHTTPServer(("", port), handler) as httpd:
        print(f"Serving {ROOT}")
        print(f"http://localhost:{port}  (custom 404.html enabled)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")


if __name__ == "__main__":
    main()
