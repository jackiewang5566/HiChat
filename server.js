const express = require('express');
const app = express();
const http = require('http');
const path = require('path');


app.use(express.static(path.join(__dirname, '/www')));
// app.get('/', function (req, res) {
//     res.sendFile('index.html', { root: path.join(__dirname, '/www') });
// })


var server = http.createServer(app);
server.listen(80);

var io = require('socket.io').listen(server)
io.on('connection', function (socket) {
    // socket.emit('news', { hello: 'world' });
    socket.on('foo', function (data) {
        console.log(data);
    });
})

console.log('server started');