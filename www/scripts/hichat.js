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

        // add event listener for system event
        this.socket.on('system', function (nickName, userCount, type) {
            // check if user is going to connect or disconnect
            var msg = nickName + (type == 'login' ? ' joined' : ' left');
            // define default system msg color to red
            that._displayNewMsg('system', msg, 'red');
            // show total # of people
            document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';
        });

        // add event listener for click button
        document.getElementById('sendBtn').addEventListener('click', function () {
            var messageInput = document.getElementById('messageInput');
            var msg = messageInput.value;
            // clear previous message
            messageInput.value = '';
            messageInput.focus();
            if (msg.trim().length !== 0) {
                // send msg to server
                that.socket.emit('postMsg', msg);
                // show msg in chat panel
                that._displayNewMsg('me', msg);
            }
        }, false);

        // receive new msg on client side
        this.socket.on('newMsg', function (user, msg) {
            that._displayNewMsg(user, msg);
        });

        // add event listener for send image
        document.getElementById('sendImage').addEventListener('change', function () {
            // check if there is file being selected
            if (this.files.length !== 0) {
                // get file and using FileReader to read file
                var file = this.files[0];
                var reader = new FileReader();
                if (!reader) {
                    that._displayNewMsg('system', '!your browser doesn\'t support fileReader', 'red');
                    this.value = '';
                    return;
                }
                reader.onload = function (e) {
                    // if reading successfully, render it on page and send it to server
                    this.value = '';
                    that._displayImage('me', e.target.result);
                    that.socket.emit('img', e.target.result);
                };
                reader.readAsDataURL(file);
            }
        }, false);

        // receive user sent image from server and show it on other users chat panel
        this.socket.on('newImg', function (user, img) {
            that._displayImage(user, img);
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
    },
    _displayImage: function (user, imgData, color) {
        var container = document.getElementById('historyMsg');
        var msgToDisplay = document.createElement('p');
        var date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + 
                                '<span class="timespan">(' + date + '): </span> <br/>' + 
                                '<a href="' + imgData + '" target="_blank"><img src="' +
                                imgData + '"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    }
}