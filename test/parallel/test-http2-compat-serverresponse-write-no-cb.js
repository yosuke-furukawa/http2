'use strict';

const common = require('../common');
const assert = require('assert');
const h2 = require('http2');

// Http2ServerResponse.write does not imply there is a callback

{
  const server = h2.createServer();
  server.listen(0, common.mustCall(function() {
    const port = server.address().port;
    const url = `http://localhost:${port}`;
    const client = h2.connect(url, common.mustCall(function() {
      const headers = {
        ':path': '/',
        ':method': 'GET',
        ':scheme': 'http',
        ':authority': `localhost:${port}`
      };
      const request = client.request(headers);
      request.end();
      request.resume();
    }));

    server.once('request', common.mustCall(function(request, response) {
      client.destroy();
      response.stream.session.on('close', common.mustCall(function() {
        response.on('error', common.mustCall(function(err) {
          assert.strictEqual(err.message, 'HTTP/2 Stream has been closed');
        }));
        response.write('muahaha');
        server.close();
      }));
    }));
  }));
}

{
  const server = h2.createServer();
  server.listen(0, common.mustCall(function() {
    const port = server.address().port;
    const url = `http://localhost:${port}`;
    const client = h2.connect(url, common.mustCall(function() {
      const headers = {
        ':path': '/',
        ':method': 'get',
        ':scheme': 'http',
        ':authority': `localhost:${port}`
      };
      const request = client.request(headers);
      request.end();
      request.resume();
    }));

    server.once('request', common.mustCall(function(request, response) {
      client.destroy();
      response.stream.session.on('close', common.mustCall(function() {
        response.write('muahaha', common.mustCall(function(err) {
          assert.strictEqual(err.message, 'HTTP/2 Stream has been closed');
        }));
        server.close();
      }));
    }));
  }));
}

{
  const server = h2.createServer();
  server.listen(0, common.mustCall(function() {
    const port = server.address().port;
    const url = `http://localhost:${port}`;
    const client = h2.connect(url, common.mustCall(function() {
      const headers = {
        ':path': '/',
        ':method': 'get',
        ':scheme': 'http',
        ':authority': `localhost:${port}`
      };
      const request = client.request(headers);
      request.end();
      request.resume();
    }));

    server.once('request', common.mustCall(function(request, response) {
      response.stream.session.on('close', common.mustCall(function() {
        response.write('muahaha', 'utf8', common.mustCall(function(err) {
          assert.strictEqual(err.message, 'HTTP/2 Stream has been closed');
        }));
        server.close();
      }));
      client.destroy();
    }));
  }));
}
