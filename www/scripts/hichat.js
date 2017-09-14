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
                that.socket.emit('login', nickName);
            } else {
                // if it's empty
                document.getElementById('nicknameInput').focus();
            }
        }, false);

        // add event listener for existed nick name
        this.socket.on('nickExisted', function () {
            document.getElementById('info').textContent = '!nickname is taken, please choose another one';
        });

        // add event listener for login success
        this.socket.on('loginSuccess', function () {
            var nickname = document.getElementById('nicknameInput').value;
            document.title = 'hichat | ' + nickname;

            document.getElementById('loginWrapper').style.display = 'none';

            document.getElementById('messageInput').focus();
        });

        this.socket.on('system', function (nickName, userCount, type) {
            // check if user is going to connect or disconnect
            var msg = nickName + (type == 'login' ? ' joined' : ' left');
            // define default system msg color to red
            that._displayNewMsg('system', msg, 'red');
            // show total # of people
            document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';
        });
    },
    _displayNewMsg: function (user, msg, color) {
        var container = document.getElementById('historyMsg');
        var msgToDisplay = document.createElement('p');
        var date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + msg;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    }
}