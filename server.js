var express = require('express');
var path = require('path');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var port = 8080;
var users = [];

app.use(express.static(path.join(__dirname, "public")));

io.on('connection', function(socket) {
    //console.log('new connection made');


    // Show all users when first logged on
    socket.on('get-users', function(data) {
        socket.emit('all-users', users);
    });

    // When new socket joins
    socket.on('join', function(data) {
        socket.nickname = data.nickname;
        
        var userObj = {
            nickname: data.nickname,
            socketid: socket.id,
            score: 0,
            role: "观众",
            status: "未下注",
            cards: [0, 0, 0, 0, 0],
            stake: 0
        }
        users.push(userObj);
        console.log(users);
        io.emit('all-users', users);
    });

    // Send a message
    socket.on('send-message', function(data) {
        // socket.broadcast.emit('message-received', data);
        data.timestamp = new Date().getTime();
        io.emit('message-received', data);
    });

    // Send a ctrl message
    socket.on('send-ctrlmessage', function(data) {
        // socket.broadcast.emit('message-received', data);

        switch(data.message) {
            case "0":
                for (x in users) {
                    if (users[x].nickname == socket.nickname) {  // data.from
                        users[x].stake = 0;
                        users[x].status = "未下注";
                        users[x].role = "观众";
                        data.message = "我是吃瓜群众";
                        break;
                    } 
                }
                break;
            case "1":
                for (x in users) {
                    if (users[x].nickname == socket.nickname) {  // data.from
                        users[x].stake += 1;
                        users[x].role = "闲家";
                        users[x].status = "下注中";
                        data.message = "本局下注为" + users[x].stake;
                        break;
                    } 
                }
                break;
            case "2":
                for (x in users) {
                    if (users[x].nickname == socket.nickname) {  // data.from
                        users[x].stake += 2;
                        users[x].role = "闲家";
                        users[x].status = "下注中";
                        data.message = "本局下注为" + users[x].stake;
                        break;
                    } 
                }
                break;
            case "5":
                for (x in users) {
                    if (users[x].nickname == socket.nickname) {  // data.from
                        users[x].stake += 5;
                        users[x].role = "闲家";
                        users[x].status = "下注中";
                        data.message = "本局下注为" + users[x].stake;
                        break;
                    } 
                }
                break;
            case "10":
                for (x in users) {
                    if (users[x].nickname == socket.nickname) {  // data.from
                        users[x].stake += 10;
                        users[x].role = "闲家";
                        users[x].status = "下注中";
                        data.message = "本局下注为" + users[x].stake;
                        break;
                    } 
                }
                break;
            case "ready":
                data.message = "买定离手，准备赢钱";
                for (x in users) {
                    if (users[x].nickname == socket.nickname) {  // data.from
                        users[x].status = "准备好了";
                    } 
                }
                break;
            case "banker":
                data.message = "当庄家并重新开局，请其他人下注";
                for (x in users) {
                    users[x].status = "未下注";
                    users[x].role = "观众";
                    users[x].stake = 0;
                    users[x].cards = [0, 0, 0, 0, 0]
                    if (users[x].nickname == socket.nickname) {  // data.from
                        users[x].role = "庄家";
                        users[x].status = "等待中";
                    } 
                }
                break;
            case "nobanker":
                data.message = "不当庄家了，谁要当请重新开局";
                for (x in users) {
                    users[x].status = "未下注";
                    users[x].role = "观众";
                    users[x].stake = 0;
                    users[x].cards = [0, 0, 0, 0, 0]
                }
                break;
            case "prestart":
                data.message = "准备发牌了，快快买定离手";
                for (x in users) {
                    if (users[x].nickname == socket.nickname) {  // data.from
                        users[x].status = "准备发牌";
                    } 
                }
                break;
            case "start":
                data.message = "开始发牌";
                for (x in users) {
                    if (users[x].nickname == socket.nickname) {  // data.from
                        users[x].status = "已发牌";
                    } else {
                        if (users[x].stake > 0) {
                            users[x].status = "已发牌";
                        }
                    }
                }
                break;
            case "end":
                data.message = "上一局已经结束";
                for (x in users) {
                    if (users[x].nickname == socket.nickname) {  // data.from
                        users[x].status = "等待中";
                        users[x].cards = [0, 0, 0, 0, 0]
                    } else {
                        users[x].status = "未下注";
                        users[x].role = "观众";
                        users[x].stake = 0;
                        users[x].cards = [0, 0, 0, 0, 0]
                    }
                }
                break;
            default:
                console.log("Received wrong control message (" + data.message + ") from " + data.from);
                return;
        }

        data.timestamp = new Date().getTime();
        io.emit('ctrlmessage-received', data);

        io.emit('all-users', users);
    });

    socket.on('disconnect', function() {
        users = users.filter(function(item) {
            return item.nickname !== socket.nickname;
        });
        io.emit('all-users', users);
    });

});

server.listen(port, function() {
    console.log("Listening on port " + port);
});