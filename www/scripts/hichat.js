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
            // get color
            var color = document.getElementById('colorStyle').value;
            // clear previous message
            messageInput.value = '';
            messageInput.focus();
            if (msg.trim().length !== 0) {
                // send msg to server
                that.socket.emit('postMsg', msg, color);
                // show msg in chat panel
                that._displayNewMsg('me', msg, color);
            }
        }, false);

        // receive new msg on client side
        this.socket.on('newMsg', function (user, msg, color) {
            that._displayNewMsg(user, msg, color);
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
                    // get color
                    var color = document.getElementById('colorStyle').value;
                    that._displayImage('me', e.target.result, color);
                    that.socket.emit('img', e.target.result, color);
                };
                reader.readAsDataURL(file);
            }
        }, false);

        // receive user sent image from server and show it on other users chat panel
        this.socket.on('newImg', function (user, img, color) {
            that._displayImage(user, img, color);
        });

        // initilize emoji for each user
        that._initialEmoji();
        // add event listener for emoji click, open emoji window
        document.getElementById('emoji').addEventListener('click', function (e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            emojiwrapper.style.display = 'block';
            e.stopPropagation();
        }, false);
        // add event listener for closing the emoji window
        document.body.addEventListener('click', function (e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            if (e.target !== emojiwrapper) {
                emojiwrapper.style.display = 'none';
            }
        });

        // pass specific selected emoji to user's typed msg
        document.getElementById('emojiWrapper').addEventListener('click', function (e) {
            // get selected emoji and added to msg panel
            var target = e.target;
            if (target.nodeName.toLowerCase() === 'img') {
                var messageInput = document.getElementById('messageInput');
                messageInput.focus();
                messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
            }
        }, false);

        // add keyup event listener to check keycode to enter nickname
        document.getElementById('nicknameInput').addEventListener('keyup', function (e) {
            if (e.keyCode === 13) {
                var nickName = document.getElementById('nicknameInput').value;
                if (nickName.trim().length !== 0) {
                    that.socket.emit('login', nickName);
                }
            }
        }, false);

        // add keyup event listener
        document.getElementById('messageInput').addEventListener('keyup', function (e) {
            var messageInput = document.getElementById('messageInput');
            var msg = messageInput.value;
            var color = document.getElementById('colorStyle').value;
            if (e.keyCode === 13 && msg.trim().length !== 0) {
                messageInput.value = '';
                that.socket.emit('postMsg', msg, color);
                that._displayNewMsg('me', msg, color);
            }
        }, false);
    },
    _displayNewMsg: function (user, msg, color) {
        var container = document.getElementById('historyMsg');
        var msgToDisplay = document.createElement('p');
        var date = new Date().toTimeString().substr(0, 8);

        // convert emoji string in message to picture emoji
        msg = this._showEmoji(msg);

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
    },
    _initialEmoji: function () {
        var emojiContainer = document.getElementById('emojiWrapper');
        var docFragment = document.createDocumentFragment();
        for (var i = 69; i > 0; i--) {
            var emojiItem = document.createElement('img');
            emojiItem.src = '../content/emoji/' + i + '.gif';
            emojiItem.title = i;
            docFragment.appendChild(emojiItem);
        }
        emojiContainer.appendChild(docFragment);
    },
    _showEmoji: function (msg) {
        var match, result = msg;
        var reg = /\[emoji:\d+\]/g;
        var emojiIndex;
        var totalEmojiNum = document.getElementById('emojiWrapper').children.length;
        // The exec() method executes a search for a match in a specified string, returns a result array or null. 
        while (match = reg.exec(msg)) {
            emojiIndex = match[0].slice(7, -1);
            if (emojiIndex > totalEmojiNum) {
                result = result.replace(match[0], '[X]');
            } else {
                result = result.replace(match[0], '<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif" />');
            }
        }
        return result;
    }
}