import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

HOST = '0.0.0.0'
PORT = 8000

_ITEMS = [
    {"id": 1, "title": "Cadeira", "description": "Boa condição", "donor": "João", "category": "Móveis", "location": "Brasília"},
    {"id": 2, "title": "Mesa", "description": "Pequenas marcas", "donor": "Maria", "category": "Móveis", "location": "Goiânia"},
]
_NEXT_ID = 3


class Handler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200, content_type='application/json'):
        self.send_response(status)
        self.send_header('Content-type', content_type)
        # CORS headers - allow frontend to call this API during development
        # Use wildcard during local development so requests from any localhost origin succeed
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE, PATCH')
        # Permitir headers comuns e condicionais (ETag/If-None-Match) usados em preflight
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, If-None-Match, If-Modified-Since, ETag, X-Requested-With')
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path == '/api/health':
            self._set_headers()
            self.wfile.write(json.dumps({'status': 'ok'}).encode())
            return
        if path == '/api/items':
            self._set_headers()
            self.wfile.write(json.dumps({'items': _ITEMS}).encode())
            return
        if path == '/api/items/my-items':
            # return only items created by the demo donor 'dev'
            my = [it for it in _ITEMS if it.get('donor') == 'dev']
            self._set_headers()
            self.wfile.write(json.dumps({'items': my}).encode())
            return
        if path == '/api/profile':
            # simple profile read - return demo user
            self._set_headers()
            profile = {
                'name': 'Dev User',
                'email': 'dev@example.com',
                'userType': 'doador',
                'user_id': 'user-abc-1'
            }
            self.wfile.write(json.dumps({'profile': profile}).encode())
            return
        self._set_headers(404)
        self.wfile.write(json.dumps({'detail': 'Not found'}).encode())

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length).decode() if length else ''
        try:
            payload = json.loads(body) if body else {}
        except Exception:
            payload = {}

        global _NEXT_ID

        if path == '/api/login':
            self._set_headers()
            self.wfile.write(json.dumps({'access_token': 'fake-token-123', 'user_id': 'user-abc-1'}).encode())
            return
        if path == '/api/items':
            title = payload.get('title')
            description = payload.get('description')
            category = payload.get('category', 'Outros')
            location = payload.get('location', '')
            if not title or not description:
                self._set_headers(400)
                self.wfile.write(json.dumps({'detail': 'title and description required'}).encode())
                return
            new_item = {
                'id': _NEXT_ID,
                'title': title,
                'description': description,
                'donor': 'dev',
                'category': category,
                'location': location,
                'photo_url': None,
                'status': 'disponível',
                'created_at': 'now'
            }
            _ITEMS.append(new_item)
            _NEXT_ID += 1
            self._set_headers(201)
            self.wfile.write(json.dumps({'ok': True, 'item': new_item}).encode())
            return
        if path == '/api/contact':
            self._set_headers()
            self.wfile.write(json.dumps({'ok': True, 'payload': payload}).encode())
            return
        self._set_headers(404)
        self.wfile.write(json.dumps({'detail': 'Not found'}).encode())

    def do_OPTIONS(self):
        # Respond to CORS preflight
        self.send_response(204)
        # Allow any origin in development; for production set this to your frontend origin
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE, PATCH')
        # Permitir headers comuns e condicionais (ETag/If-None-Match) usados em preflight
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, If-None-Match, If-Modified-Since, ETag, X-Requested-With')
        self.end_headers()

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path.startswith('/api/items/'):
            try:
                item_id = int(path.rsplit('/', 1)[-1])
            except Exception:
                self._set_headers(400)
                self.wfile.write(json.dumps({'detail': 'invalid id'}).encode())
                return
            global _ITEMS
            before = len(_ITEMS)
            _ITEMS = [it for it in _ITEMS if int(it.get('id')) != item_id]
            if len(_ITEMS) == before:
                self._set_headers(404)
                self.wfile.write(json.dumps({'detail': 'Item not found'}).encode())
                return
            self._set_headers()
            self.wfile.write(json.dumps({'ok': True}).encode())
            return
        if path.startswith('/api/profile'):
            # no delete for profile
            self._set_headers(405)
            self.wfile.write(json.dumps({'detail': 'Method not allowed'}).encode())
            return
        if path.startswith('/api/items/'):
            # handled above already
            pass
        self._set_headers(404)
        self.wfile.write(json.dumps({'detail': 'Not found'}).encode())

    def do_PATCH(self):
        # support small updates to profile and items
        parsed = urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length).decode() if length else ''
        try:
            payload = json.loads(body) if body else {}
        except Exception:
            payload = {}

        if path == '/api/profile':
            # accept name updates
            name = payload.get('name')
            if not name:
                self._set_headers(400)
                self.wfile.write(json.dumps({'detail': 'name required'}).encode())
                return
            # pretend we saved it
            self._set_headers()
            self.wfile.write(json.dumps({'ok': True, 'profile': {'name': name}}).encode())
            return

        if path.startswith('/api/items/'):
            try:
                item_id = int(path.rsplit('/', 1)[-1])
            except Exception:
                self._set_headers(400)
                self.wfile.write(json.dumps({'detail': 'invalid id'}).encode())
                return
            for it in _ITEMS:
                if int(it.get('id')) == item_id:
                    # update allowed fields e.g., status
                    if 'status' in payload:
                        it['status'] = payload['status']
                    if 'title' in payload:
                        it['title'] = payload['title']
                    self._set_headers()
                    self.wfile.write(json.dumps({'ok': True, 'item': it}).encode())
                    return
            self._set_headers(404)
            self.wfile.write(json.dumps({'detail': 'Item not found'}).encode())
            return


if __name__ == '__main__':
    server = HTTPServer((HOST, PORT), Handler)
    print(f"Starting simple server at http://{HOST}:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('Shutting down')
        server.server_close()
