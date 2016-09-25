var express = require('express');
var path = require('path');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var port = 8080;
var users = [];

var allCards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
                    14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
                    27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
                    40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52];
var cardsNumber = 52;

function shuffle() {
    for (var i=0; i<cardsNumber; i++) {
        var r1 = (Math.round(Math.random() * cardsNumber) + 1) % cardsNumber;
        var r2 = (Math.round(Math.random() * cardsNumber) + 1) % cardsNumber;

        //console.log(i + " " + r1 + " " + r2 + " " + allCards[r1] + " " + allCards[r2]);

        var card = allCards[r1];
        allCards[r1] = allCards[r2];
        allCards[r2] = card;
    }
}

function describeCard(card) {
    var color = Math.floor((card - 1) / 13);
    var number = (card - 1 ) % 13 + 1;
    var desc = "";
    console.log(card + " " + color + " " + number)
    switch(color) {
        case 0:
            desc += "♦️";
            break;
        case 1:
            desc += "♣️";
            break;
        case 2:
            desc += "♥️";
            break;
        case 3:
            desc += "♠️";
            break;
        default:
            desc += "ERR";
    }

    switch(number) {
        case 11:
            desc += "J";
            break;
        case 12:
            desc += "Q";
            break;
        case 13:
            desc += "K";
            break;
        default:
            desc += number;
    }

    return desc;
}

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
            cardsDesc: "",
            stake: 0
        }
        users.push(userObj);
        console.log(new Date() + " Login - " + data.nickname);
        //console.log(users);
        io.emit('all-users', users);

        var message = {
            from: socket.nickname,
            timestamp: new Date().getTime(),
            message: "加入了游戏"
        }
        io.emit('ctrlmessage-received', message);
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
                    users[x].cards = [0, 0, 0, 0, 0];
                    users[x].cardsDesc = "";
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
                    users[x].cardsDesc = "";
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
                data.timestamp = new Date().getTime();
                io.emit('ctrlmessage-received', data);

                shuffle();
                var playerNo = 0;
                for (x in users) {
                    if (users[x].role == "观众") {
                        continue;
                    }

                    if ((users[x].role == "闲家") && (users[x].status !== "准备好了")) {
                        //console.log(users[x].nickname + " " + users[x].role + "" + users[x].status);
                        continue;
                    }

                    for (var i=0; i<5; i++) {
                        var card = allCards[playerNo*5+i];
                        users[x].cards[i] = card;
                        users[x].cardsDesc += ( " " + describeCard(card) + " ");
                    }

                    users[x].status = "已发牌";

                    playerNo++;
                }

                console.log(new Date() + " Round start");
                console.log(users);

                data.message = "结束发牌，请看牌";
                break;
            case "end":
                data.message = "上一局已经结束，结果如下：";
                for (x in users) {
                    if (users[x].nickname == socket.nickname) {  // data.from
                        users[x].status = "等待中";
                        data.message += ("   $$$ 庄家(" + users[x].nickname + ")：" + users[x].cardsDesc);
                        users[x].cards = [0, 0, 0, 0, 0];
                        users[x].cardsDesc = "";
                    } else {
                        users[x].status = "未下注";
                        users[x].role = "观众";
                        data.message += ("   $$$ " + users[x].nickname + "：" + users[x].cardsDesc);
                        users[x].stake = 0;
                        users[x].cards = [0, 0, 0, 0, 0];
                        users[x].cardsDesc = "";
                    }
                }
                console.log(new Date() + " Round end");

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
        var message = {
            from: socket.nickname,
            timestamp: new Date().getTime(),
            message: "离开了游戏"
        }
        io.emit('ctrlmessage-received', message);
        users = users.filter(function(item) {
            return item.nickname !== socket.nickname;
        });
        io.emit('all-users', users);
    });

});

server.listen(port, function() {
    console.log("Listening on port " + port);
});