(function() {
    'use strict';

    angular
        .module('app')
        .controller('JoinCtrl', JoinCtrl);

    JoinCtrl.$inject = ['$location', '$scope', '$localStorage', 'socket'];

    function JoinCtrl($location, $scope, $localStorage, socket) {
        $scope.name = '';
        var nickname;

        $scope.join = function() {
            nickname = $scope.name;
            nickname = nickname.replace(/^\s+|\s+$/g, ""); // remove left and right spaces
            $localStorage.nickname = nickname;

            socket.emit('verify-user', {
                nickname: nickname
            });
        }

        socket.on('verify-user-resp', function(data) {
            if (data.code == 'FAIL') {
                $scope.error = data.message;
            } else {
                socket.emit('join', {
                    nickname: nickname
                });
                $location.path('/main');
            }
        });
    }
})();