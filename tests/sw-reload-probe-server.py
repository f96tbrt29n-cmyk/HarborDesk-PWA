"""Dedicated local tests only: unchanged SW unless an explicit probe query is set."""
import argparse
import functools
import http.server
import io
import pathlib
import urllib.parse
import threading
import json

parser = argparse.ArgumentParser()
parser.add_argument('--directory', required=True)
parser.add_argument('--port', type=int, default=4173)
parser.add_argument('--gate-script', default='')
args = parser.parse_args()
root = pathlib.Path(args.directory).resolve()
gate = threading.Event()
gate.set()
gate_details = {"headerFlushed": False, "partialBytes": 0}


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if args.gate_script and self.path == '/__hd_probe_gate/state':
            content = json.dumps(gate_details).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            self.wfile.write(content)
            return
        return super().do_GET()

    def do_POST(self):
        if args.gate_script and self.path in ['/__hd_probe_gate/arm', '/__hd_probe_gate/release']:
            if self.path.endswith('/arm'):
                gate.clear()
                gate_details.update(headerFlushed=False, partialBytes=0)
            else:
                gate.set()
            self.send_response(204)
            self.end_headers()
            return
        self.send_error(501)

    def copyfile(self, source, outputfile):
        url = urllib.parse.urlsplit(self.path)
        if args.gate_script and url.path == '/' + args.gate_script and 'v' in urllib.parse.parse_qs(url.query):
            partial = source.read(1024)
            outputfile.write(partial)
            outputfile.flush()  # Server-side flush; browser notifications may be delayed.
            gate_details.update(headerFlushed=True, partialBytes=len(partial))
            gate.wait(45)       # Controlled fault only; explicit release normally ends it.
        return super().copyfile(source, outputfile)

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
