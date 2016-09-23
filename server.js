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
        // users[socket.nickname] = socket; 
        var userObj = {
            nickname: data.nickname,
            socketid: socket.id,
            score: 0,
            status: 0,
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
        data.timestamp = new Date().getTime();
        io.emit('ctrlmessage-received', data);
        // TODO
        //users[0].score = 100;

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