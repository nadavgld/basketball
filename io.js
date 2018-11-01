var fs = require('fs')
var Request = require('request')
const APIKEY = "?apiKey=z-so78xt43eKPEx8v5ZiHFmL8aRK82u_"
const SERVER_URL = "https://api.mlab.com/api/1/databases/basketball/collections/"


module.exports = {

    readDB: function () {
        return new Promise((resolve, reject) => {

            var self = this;
            var gm = {};
            gm.amount_total_players = 0;
            Request.get(SERVER_URL + "players" + APIKEY, function (error, response, body) {
                if (error) {
                    return console.error('upload failed:', error);
                }
                gm.players = JSON.parse(body);

                Request.get(SERVER_URL + "games" + APIKEY, function (error, response, body) {
                    if (error) {
                        return console.error('upload failed:', error);
                    }
                    // gm.games = JSON.parse(body);
                    gm.games = self.filterGamesByMonth(JSON.parse(body))
                    resolve(self.countGamesPerPlayer(gm))
                })
            })
        })

    },

    filterGamesByMonth: function(games){
        var thisMonth = new Date().getMonth() + 1;

        return games.filter( g => {
            var month = g.date.split(" ")[0].split("-")[1];
            return parseInt(month) == parseInt(thisMonth)
        })
    },

    writeDB: function (gm) {
        return new Promise((resolve, reject) => {

            var promises = [];
            gm.players.forEach(player => {
                if (playerAlreadyIn(player.name, gm.games))
                    promises.push(
                        Request.put({
                            url: SERVER_URL + "players" + APIKEY + '&q={"name":"' + player.name + '"}',
                            json: {
                                "score": player.score,
                                "games": player.games,
                                "name": player.name
                            },
                            function(err, httpResponse, body) {
                                console.log(err);
                                console.log(body);
                            }
                        })
                    )
                else
                    promises.push(
                        Request.post({
                            url: SERVER_URL + "players" + APIKEY,
                            json: {
                                "score": player.score,
                                "games": player.games,
                                "name": player.name
                            },
                            function(err, httpResponse, body) {
                                console.log(err);
                                console.log(body);
                            }
                        })
                    )
            })

            var lastGame = gm.games[gm.games.length - 1];
            promises.push(
                Request.post({
                    url: SERVER_URL + "games" + APIKEY,
                    json: {
                        "date": lastGame.date,
                        "players": lastGame.players,
                        "startPoint": lastGame.startPoint,
                        "text": lastGame.text
                    },
                    function(err, httpResponse, body) {
                        console.log(err);
                        console.log(body);
                    }
                })
            )

            Promise.all(promises).then(() => {
                resolve("done");
            })
        })

    },

    countGamesPerPlayer: function (gm) {
        var players = gm.players;
        var games = gm.games;

        games.forEach(game => {
            game.players.forEach(gamePlayer => {
                gm.amount_total_players++;
            })
        })

        return gm;
    }

};

function playerAlreadyIn(player, games) {
    if (games.length == 0)
        return true;

    for (var i = 0; i < games.length - 1; i++) {
        var g = games[i];
        if (g.players.indexOf(player) > -1)
            return true;
    }

    return false;
}
