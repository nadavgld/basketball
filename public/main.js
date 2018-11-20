var app = angular.module('basket-app', [])
const VAPID_PUK = "BCB6ML2HofKZEv4IC61YQW47L9c8M-7_uVA6UF6DxKC9AFcgOiZBaXE_wIrO-uJ_u1_dArvbNrJHbF6uyrD7Ql4"

if('serviceWorker' in navigator){
    navigator.serviceWorker.getRegistration().then(_service => {    
        if(!_service.scope || _service.length == 0)
        send().catch(err => console.error(err))
    })
}

async function send(){
    const REGISTER = await navigator.serviceWorker.register('service-worker.js', {
        scope: '/'
    })

    const SUBSCRIPTION = await REGISTER.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUK)
    })

    await fetch('https://siemens-basketball.herokuapp.com/subscribe', {
        method: 'POST',
        body: JSON.stringify(SUBSCRIPTION),
        headers: {
            'content-type': 'application/json'
        }
    })
}

app.controller('mainController', ['$scope', '$http','$sce', function ($scope, $http,$sce) {
    var scope = $scope;
    var http = $http;

    // const host = window.location.hostname;
    const host = "https://siemens-basketball.herokuapp.com";
    // const host = "localhost";
    const port = 5000;

    scope.scores;
    scope.newPlayer = {};
    scope.selectedPlayer = {};

    scope.showNewGame = false;
    scope.NewGameButtonText = "Add Game";

    scope.players;
    scope.tmpPlayers;
    scope.newPlayers = [];
    scope.startPlayers = [];

    scope.init = function () {
        showLoading();
        scope.fetchScores();
        scope.fetchPlayers();
    }

    scope.fetchScores = function () {
        http.get(hostPortJoin(host, port) + "/scores").then((response) => {
            scope.scores = response.data;
        })
    }

    scope.fetchPlayers = function () {
        http.get(hostPortJoin(host, port) + "/players").then((response) => {
            scope.players = response.data;
            hideLoading();
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

                    console.log(scope.startPlayers);
                    var body = {
                        "players": scope.newPlayers,
                        "start": scope.startPlayers
                    }

                    http.post(hostPortJoin(host, port) + "/games", body).then(response => {
                        hideLoading();

                        scope.newPlayers = [];
                        scope.startPlayers = [];
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

    scope.startGame = function(){
        if(scope.newPlayers.length >= 2)
            scope.startPlayers = JSON.parse(JSON.stringify(scope.newPlayers))
    }

    scope.selectPlayer = function (player) {
        if (scope.selectedPlayer.name == player) {
            scope.selectedPlayer.name = "";
            scope.selectedPlayer.games = [];
        } else {
            scope.selectedPlayer.name = player;
            scope.selectedPlayer.games = [];

            http.get(hostPortJoin(host, port) + "/games").then((response) => {
                scope.selectedPlayer.games = scope.filterGamesByName(player, response.data);
            })
        }
    }

    scope.filterGamesByName = function (name, games) {
        return games.filter(g => {
            return g.players.indexOf(name) > -1
        })
    }

    scope.trustAsHtml = function(text){
        return $sce.trustAsHtml(text)
    }

    scope.shuffleGame = function () {
        if (scope.newPlayers.length >= 2) {
            var randArray = [];
            var tmp = JSON.parse(JSON.stringify(scope.newPlayers));
            const amount = scope.newPlayers.length;

            while (randArray.length < amount) {
                var r = Math.floor(Math.random() * tmp.length)
                var playerToSwitch = tmp[r];
                randArray.push(playerToSwitch);
                tmp.splice(r, 1);
            }

            scope.newPlayers = randArray;
        }
    }

    scope.resetGame = function () {
        scope.newPlayers = [];
        scope.startPlayers = [];
        scope.tmpPlayers = JSON.parse(JSON.stringify(scope.players));
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
    $(".lds-circle").hide();
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }