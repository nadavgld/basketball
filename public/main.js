var app = angular.module('basket-app', [])

app.controller('mainController', ['$scope', '$http', function ($scope, $http) {
    var scope = $scope;
    var http = $http;

    // const host = window.location.hostname;
    const host = "https://siemens-basketball.herokuapp.com";
    const port = 5000;

    scope.scores;
    scope.newPlayer = {};
    scope.selectedPlayer = {};

    scope.showNewGame = false;
    scope.NewGameButtonText = "Add Game";

    scope.players;
    scope.tmpPlayers;
    scope.newPlayers = [];

    scope.init = function () {
        showLoading();
        scope.fetchScores();
        scope.fetchPlayers();
        hideLoading();
    }

    scope.fetchScores = function () {
        http.get(hostPortJoin(host, port) + "/scores").then((response) => {
            scope.scores = response.data;
        })
    }

    scope.fetchPlayers = function () {
        http.get(hostPortJoin(host, port) + "/players").then((response) => {
            scope.players = response.data;
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
                return "table-item";
        }
    }

    scope.toggleNewGame = function () {
        if (!scope.players) {
            console.log(scope.scores);
            scope.players = scope.scores.map(s => s.name)
        }

        if (!scope.showNewGame) {
            scope.showNewGame = true;
            scope.NewGameButtonText = "Hide Add Game";

            scope.newPlayers = [];
            scope.tmpPlayers = JSON.parse(JSON.stringify(scope.players));
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
        if (scope.newPlayer.name.length == 0)
            return;

        if (scope.tmpPlayers.indexOf(scope.newPlayer.name) == -1 && scope.newPlayers.indexOf(scope.newPlayer.name) == -1) {
            scope.newPlayers.push(scope.newPlayer.name)
            scope.newPlayer.name = ''
        } else {
            scope.newPlayer.name = ''
        }
    }

    scope.sendScore = function () {
        showLoading();
        if (scope.newPlayers.length < 2) {
            alert("Game must contain atleast 2 players")
            hideLoading();
            return;
        }

        var ps = prompt("Enter password");

        if (!ps) {
            hideLoading();
            return;
        }

        else {
            http.get(hostPortJoin(host, port) + "/password/" + ps).then(response => {
                if (response.data.success) {
                    alert("sucess!")
                    var body = {
                        "players": scope.newPlayers
                    }

                    http.post(hostPortJoin(host, port) + "/games", body).then(response => {
                        hideLoading();

                        scope.newPlayers = [];
                        scope.scores = response.data.scores;
                        scope.players = response.data.players;
                        scope.tmpPlayers = JSON.parse(JSON.stringify(scope.players));

                    })
                } else {
                    alert("Wrong password!")
                    hideLoading();
                }
            })
        }
    }

    scope.selectPlayer = function(player){
        if(scope.selectedPlayer.name == player){
            scope.selectedPlayer.name = "";
            scope.selectedPlayer.games = [];
        }else{
            scope.selectedPlayer.name = player;
            scope.selectedPlayer.games = [];

            http.get(hostPortJoin(host, port) + "/games").then((response) => {
                scope.selectedPlayer.games = scope.filterGamesByName(player,response.data);
            })
        }
    }

    scope.filterGamesByName = function(name, games){
        return games.filter(g => {
            return g.players.indexOf(name) > -1
        })
    }
}])

function hostPortJoin(host, port) {
    // return "http://" + host + ':' + port;
    return host;
}

function showLoading() {
    $(".lds-circle").show();
}

function hideLoading() {
    setTimeout(() => {
        $(".lds-circle").hide();
    }, 1000);
}