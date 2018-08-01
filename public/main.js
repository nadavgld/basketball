var app = angular.module('basket-app', [])

app.controller('mainController', ['$scope', '$http', function ($scope, $http) {
    var scope = $scope;
    var http = $http;

    const host = window.location.hostname;
    const port = 3333;

    scope.scores;
    scope.newPlayer = {};

    scope.showNewGame = false;
    scope.NewGameButtonText = "Add Game";

    scope.players;
    scope.tmpPlayers;
    scope.newPlayers = [];

    scope.init = function () {
        scope.fetchScores();
        scope.fetchPlayers();
    }

    scope.fetchScores = function () {
        $http.get(hostPortJoin(host, port) + "/scores").then((response) => {
            scope.scores = response.data;
        })
    }

    scope.fetchPlayers = function () {
        // return new Promise((resolve, reject) => {
            $http.get(hostPortJoin(host, port) + "/players").then((response) => {
                scope.players = response.data;
                // resolve();
            })
        // })
    }

    scope.tableClass = function (index) {
        index = parseInt(index);

        switch (index) {
            case 0:
                return "gold"
            case 1:
                return "silver"
            case 2: return "bronze"

            default:
                return;
        }
    }

    scope.toggleNewGame = function () {
        if (!scope.showNewGame) {
            scope.showNewGame = true;
            scope.NewGameButtonText = "Hide Add Game";

            scope.newPlayers = [];
            scope.tmpPlayers = JSON.parse(JSON.stringify(scope.players));

            console.log(scope.newPlayers);
            console.log(scope.tmpPlayers);
        } else {
            scope.showNewGame = false;
            scope.NewGameButtonText = "Add Game";
        }
    }

    scope.ltr = function (item) {
        scope.tmpPlayers.splice(scope.tmpPlayers.indexOf(item), 1);
        scope.newPlayers.push(item)
    }

    scope.rtl = function (item) {
        scope.newPlayers.splice(scope.newPlayers.indexOf(item), 1);
        scope.tmpPlayers.push(item)
    }

    scope.addNewPlayer = function () {
        if(scope.newPlayer.name.length == 0)
            return;

        if (scope.tmpPlayers.indexOf(scope.newPlayer.name) == -1 && scope.newPlayers.indexOf(scope.newPlayer.name) == -1) {
            scope.newPlayers.push(scope.newPlayer.name)
            scope.newPlayer.name = ''
        } else {
            scope.newPlayer.name = ''
        }
    }

    scope.sendScore = function () {
        if (scope.newPlayers.length < 2) {
            alert("Game must contain atleast 2 players")
            return;
        }
    }
}])

function hostPortJoin(host, port) {
    return "http://" + host + ':' + port;
}