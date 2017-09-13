window.onload = function () {
    var hichat = new HiChat();
    hichat.init();
};

var HiChat = function () {
    this.socket = null;
};

// add function on prototype 
HiChat.prototype = {
    init: function () {
        var that = this;
        // create connect to server
        this.socket = io.connect();
        // listen connect event
        this.socket.on('connect', function () {
            // show nick name input after connection
            document.getElementById('info').textContent = 'get yourself a nickname :)';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        })
    }
}