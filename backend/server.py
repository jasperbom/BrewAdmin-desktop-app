#!/usr/bin/env python3
"""
Brouwerij Admin - backend server
Serves the HTML app and stores all data as JSON files in /data/

Supports Home Assistant Ingress: requests arrive with a path prefix like
  /api/hassio_ingress/<TOKEN>/api/data/<key>
The server strips any prefix and looks for /api/data/<key> anywhere in the path.
"""
import http.server
import json
import os
from pathlib import Path

# Paths configurable via env vars (voor Desktop app) met fallback voor HA addon
_default_data = Path('/data')
_default_static = Path('/app/static/index.html')

DATA_DIR = Path(os.environ.get('DATA_DIR', str(_default_data)))
STATIC_FILE = Path(os.environ.get('STATIC_FILE', str(_default_static)))

DATA_DIR.mkdir(parents=True, exist_ok=True)

API_DATA_PREFIX = '/api/data/'


def extract_key(path):
    """Extract data key from path, supporting ingress path prefixes."""
    path = path.split('?')[0]
    idx = path.find(API_DATA_PREFIX)
    if idx < 0:
        return None
    key = path[idx + len(API_DATA_PREFIX):].strip('/')
    if not key or not all(c.isalnum() or c == '_' for c in key):
        return None
    return key


class BrouwerijHandler(http.server.BaseHTTPRequestHandler):

    def send_json(self, status, data):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', len(body))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        path = self.path.split('?')[0]
        key = extract_key(path)

        if key is not None:
            filepath = DATA_DIR / f'{key}.json'
            if filepath.exists():
                body = filepath.read_bytes()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', len(body))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(body)
            else:
                self.send_json(404, None)
            return

        # Serve the app for all other routes
        try:
            body = STATIC_FILE.read_bytes()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', len(body))
            self.end_headers()
            self.wfile.write(body)
        except FileNotFoundError:
            self.send_response(500)
            self.end_headers()

    def do_POST(self):
        path = self.path.split('?')[0]
        key = extract_key(path)

        if key is not None:
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            try:
                json.loads(body)  # validate JSON
            except json.JSONDecodeError:
                self.send_json(400, {'error': 'invalid json'})
                return
            filepath = DATA_DIR / f'{key}.json'
            filepath.write_bytes(body)
            self.send_json(200, {'ok': True})
            return

        self.send_json(404, {'error': 'not found'})

    def log_message(self, format, *args):
        # Only log errors to keep logs clean
        if args and len(args) >= 2 and str(args[1]) not in ('200', '404', '204'):
            print(f'{self.address_string()} {format % args}', flush=True)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8099))
    print(f'Brouwerij Admin gestart op poort {port}', flush=True)
    print(f'Data opgeslagen in {DATA_DIR}', flush=True)
    server = http.server.HTTPServer(('0.0.0.0', port), BrouwerijHandler)
    server.serve_forever()
