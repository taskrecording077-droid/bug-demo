const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload, null, 2));
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendJson(res, 500, { error: 'Unable to read file', details: err.message });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.txt': 'text/plain; charset=utf-8'
    }[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function handleApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const page = Number(url.searchParams.get('page') || 1);
  const limit = Number(url.searchParams.get('limit') || 25);

  if (!Number.isInteger(page) || page < 1) {
    return sendJson(res, 400, { error: 'page must be >= 1' });
  }

  try {
    const email = url.searchParams.get('email');
    const lowerEmail = (email || '').toLowerCase();
    const offset = (page - 1) * limit;
    const users = [
      { id: 1, email: 'alice@example.com' },
      { id: 2, email: 'bob@example.com' },
      { id: 3, email: 'carol@example.com' }
    ].filter((user) => user.email.toLowerCase().includes(lowerEmail));

    return sendJson(res, 200, {
      page,
      limit,
      offset,
      email: lowerEmail,
      users: users.slice(offset, offset + limit)
    });
  } catch (error) {
    return sendJson(res, 500, {
      error: 'Failed to process request',
      details: error.message
    });
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/search-users') {
    handleApi(req, res);
    return;
  }

  if (url.pathname === '/') {
    serveFile(res, path.join(ROOT, 'index.html'));
    return;
  }

  if (url.pathname === '/buggy_api.js') {
    serveFile(res, path.join(ROOT, 'buggy_api.js'));
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Demo running at http://localhost:${PORT}`);
});
