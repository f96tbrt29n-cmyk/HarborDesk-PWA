"""Dedicated local tests only: unchanged SW unless an explicit probe query is set."""
import argparse
import functools
import http.server
import io
import pathlib
import urllib.parse

parser = argparse.ArgumentParser()
parser.add_argument('--directory', required=True)
parser.add_argument('--port', type=int, default=4173)
args = parser.parse_args()
root = pathlib.Path(args.directory).resolve()


class Handler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        url = urllib.parse.urlsplit(self.path)
        if url.path != '/sw.js' or urllib.parse.parse_qs(url.query).get('hd_reload_probe') != ['1']:
            return super().send_head()
        content = (root / 'tests/sw-reload-probe.js').read_bytes() + b'\n' + (root / 'sw.js').read_bytes()
        self.send_response(200)
        self.send_header('Content-Type', 'application/javascript')
        self.send_header('Content-Length', str(len(content)))
        self.send_header('Last-Modified', self.date_time_string((root / 'sw.js').stat().st_mtime))
        self.end_headers()
        return io.BytesIO(content)


http.server.ThreadingHTTPServer(('127.0.0.1', args.port), functools.partial(Handler, directory=str(root))).serve_forever()
