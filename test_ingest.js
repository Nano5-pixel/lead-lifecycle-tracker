const http = require('http');
const qs = require('querystring');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/leads/ingest',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
};

const req = http.request(options, (res) => {
  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response: ${rawData}`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(qs.stringify({ apiKey: 'test', clienteId: 'test', nombre: 'Test', telefono: '123' }));
req.end();
