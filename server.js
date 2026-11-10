const http = require('http');
const net = require('net');
const tls = require('tls');

const HOST = process.env.TARGET_HOST;
const PORT = +process.env.TARGET_PORT || 443;
const USE_TLS = process.env.TARGET_TLS !== '0';
const SNI = process.env.TARGET_SNI || undefined;
const HOSTHDR = process.env.HOST_OVERRIDE;
const DROP = ['forwarded', 'x-forwarded-for', 'x-forwarded-proto',
              'x-cloud-trace-context', 'traceparent'];

http.createServer((_, res) => res.end('ok'))
  .on('upgrade', (req, client, head) => {
    const up = USE_TLS
      ? tls.connect({ host: HOST, port: PORT, servername: SNI, rejectUnauthorized: false })
      : net.connect(PORT, HOST);

    let raw = `${req.method} ${req.url} HTTP/1.1\r\n`;
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
      const k = req.rawHeaders[i], v = req.rawHeaders[i + 1];
      if (DROP.includes(k.toLowerCase())) continue;
      raw += `${k}: ${HOSTHDR && k.toLowerCase() === 'host' ? HOSTHDR : v}\r\n`;
    }
    up.write(raw + '\r\n');
    if (head.length) up.write(head);

    client.setNoDelay(true);
    client.setKeepAlive(true, 30000);
    client.pipe(up);
    up.pipe(client);

    const end = () => { client.destroy(); up.destroy(); };
    client.on('error', end); up.on('error', end);
    client.on('close', end); up.on('close', end);
  })
  .listen(process.env.PORT || 8080);
