var button = document.getElementById('sendBtn');
var express = require('express');
var http = require('http');
var socketIO = require('socket.io')
var io = socketIO.listen(server);
var app = express();
var server = http.createServer(app);

app.use('/', express.static(__dirname + '/www'));

server.listen(8080);

io.on('connection', function (socket) {
    socket.on('Hello', function (data) {
        console.log(data);
    });
})

console.log('server started');