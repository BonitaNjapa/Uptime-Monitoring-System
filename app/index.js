
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./lib/config.js');
const https = require('https');
const fs = require('fs');
const __data = require('./lib/data');
const handlers = require('./lib/handlers');
const helper = require('./lib/helpers');

let httpServer = http.createServer((req, res) => {
    unifiedServer(req, res);
});

httpServer.listen(config.httpPort, () => {
    console.log('http server running on port: ' + config.httpPort);
});

let httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};
let httpsServer = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res);
});

httpsServer.listen(config.httpsPort, () => {
    console.log('https server running on port: ' + config.httpsPort);
});


let unifiedServer = (req, res) => {
    let parsedUrl = url.parse(req.url, true);
    let path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');
    let queryString = parsedUrl.query;
    let method = req.method.toUpperCase();
    let headers = req.headers;
    let decoder = new StringDecoder('utf-8');
    let buffer = '';

    req.on('data', (data) => {
        buffer += decoder.write(data);
    });
    req.on('end', () => {
        buffer += decoder.end();
        let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
        let data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryString,
            'method': method,
            'headers': headers,
            'payload': helper.parseJsonToObject(buffer)
        };

        chosenHandler(data, (statusCode, payload) => {

            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            payload = typeof(payload) == 'object' ? payload : {};
            let payloadString = JSON.stringify(payload);
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log("Returning this response: ", statusCode, payloadString);

        });

    });
};


const router = {
    'sample': handlers.sample,
    'ping': handlers.ping,
    'users': handlers.users,
    'tokens' : handlers.tokens,
    'checks' : handlers.checks
};