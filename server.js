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
            // if user exist
            socket.emit('nickExisted');
        } else {
            // if user not exist, login success
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            // send nickname to all connected client
            io.sockets.emit('system', nickname, users.length, 'login');
        }
    });

    socket.on('disconnect', function () {
        // remove user from users if user disconnect
        users.splice(socket.userIndex, 1);
        // notify everybody except the one just leaves
        socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
    });

    socket.on('postMsg', function (msg) {
        // send msg to all users except myself
        socket.broadcast.emit('newMsg', socket.nickname, msg);
    });
    
    socket.on('img', function (imgData) {
        // receive image from users
        socket.broadcast.emit('newImg', socket.nickname, imgData);
    });
});

console.log('server started');