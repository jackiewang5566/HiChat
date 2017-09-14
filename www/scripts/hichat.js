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
            // show nick name input after connect to server
            document.getElementById('info').textContent = 'get yourself a nickname :)';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        });

        // bind event listener on loginBtn
        document.getElementById('loginBtn').addEventListener('click', function () {
            var nickName = document.getElementById('nicknameInput').value;
            // check input field is empty or not
            if (nickName.trim().length != 0) {
                // if it's not empty, trigger a login event and send nickname to server
                that.socket.emit('login', nickname);
            } else {
                // if it's empty
                document.getElementById('nicknameInput').focus();
            }
        }, false);
    }
}