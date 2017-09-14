var express = require('express');
var app = express();
var http = require('http');
var path = require('path');
var server = http.createServer(app);
var io = require('socket.io').listen(server)
var users = [];

app.use(express.static(path.join(__dirname, '/www')));

server.listen(80);

// socket part
io.on('connection', function (socket) {
    socket.on('login', function (nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            // send nickname to all connected client
            io.sockets.emit('system', nickname);
        }
    });
})

console.log('server started');