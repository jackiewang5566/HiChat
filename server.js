var express = require('express');
var http = require('http');
var app = express();

// var server = http.createServer(function (req, res) {
//     res.writeHead(200, {
//         'Content-Type': 'text/html'
//     });
//     res.write('<h1>Hello World</h1>');
//     res.end();
// });

var server = http.createServer(app);

app.use('/', express.static(__dirname + '/www'));

server.listen(8080);
console.log('server started');