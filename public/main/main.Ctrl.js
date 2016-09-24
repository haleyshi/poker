(function() {
    'use strict';

    angular
        .module('app')
        .controller('MainCtrl', MainCtrl);

    MainCtrl.$inject = ['$scope', '$localStorage', 'socket', 'lodash'];

    function MainCtrl($scope, $localStorage, socket, lodash) {
        $scope.message = '';
        $scope.users = [];
        $scope.messages = [];
        $scope.ctrlmessages = [];
        $scope.likes = [];
        $scope.mynickname = $localStorage.nickname;
        var nickname = $scope.mynickname;

        socket.emit('get-users');

        $scope.sendMessage = function(data) {
            var newMessage = {
                message: $scope.message,
                from: nickname
            }
            socket.emit('send-message', newMessage);
            // $scope.messages.push(newMessage);
            $scope.message = '';
        };

        $scope.sendCtrlMessage = function(data) {
            var newMessage = {
                    message: $scope.ctrlmessage,
                    from: nickname
                }
                //console.log(newMessage);
            socket.emit('send-ctrlmessage', newMessage);
            // $scope.messages.push(newMessage);
            $scope.ctrlmessage = '';
        };

        socket.on('all-users', function(data) {
            $scope.users = data;
            $scope.role = "nobanker";

            var len=data.length;
            for (var i=0; i<len; i++) {
                if (data[i].role == "庄家") {
                    if (data[i].nickname == nickname) {
                        if (data[i].status == "已发牌") {
                            $scope.role = "bankerfrozen";
                        } else {
                            $scope.role = "banker";
                        }
                    } else {
                        if (data[i].status == "已发牌") {
                            $scope.role = "playerfrozen";
                        } else {
                            $scope.role = "player";
                        }  
                    }

                    break;
                }
            }
        });

        socket.on('message-received', function(data) {
            //console.log(data);
            $scope.messages.unshift(data);
        });

        socket.on('ctrlmessage-received', function(data) {
            //console.log(data);
            $scope.ctrlmessages.unshift(data);
        });
    };
})();