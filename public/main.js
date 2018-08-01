var app = angular.module('basket-app', [])

app.controller('mainController', ['$scope', '$http', function ($scope, $http) {
    var scope = $scope;
    var http = $http;

    const host = window.location.hostname;
    const port = 3333;

    scope.scores;
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
        return new Promise((resolve, reject) => {
            $http.get(hostPortJoin(host, port) + "/players").then((response) => {
                scope.players = response.data;
                resolve();
            })
        })
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
            scope.NewGameButtonText = "Add Game";

            scope.newPlayers = [];
            scope.tmpPlayers = scope.players;

            console.log(scope.newPlayers);
            console.log(scope.tmpPlayers);
        } else {
            scope.showNewGame = false;
            scope.NewGameButtonText = "Hide Add Game";
        }
    }

    scope.choosePlayer = function (a) {
        scope.tmpPlayers.splice(scope.tmpPlayers.indexOf(a),1);
        scope.newPlayers.push(a);

        console.log(scope.newPlayers);
        console.log(scope.tmpPlayers);

    }
}])

function hostPortJoin(host, port) {
    return "http://" + host + ':' + port;
}