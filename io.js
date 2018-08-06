var fs = require('fs')
var Request = require('request')
const APIKEY = "?apiKey=z-so78xt43eKPEx8v5ZiHFmL8aRK82u_"
const SERVER_URL = "https://api.mlab.com/api/1/databases/basketball/collections/"


module.exports = {

    readDB: function () {
        // var scores = JSON.parse(fs.readFileSync('./scores.json', 'utf8'));
        // return this.countGamesPerPlayer(scores);

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
                    gm.games = JSON.parse(body);
                    resolve(self.countGamesPerPlayer(gm))
                })
            })
        })

    },

    writeDB: function (gm) {
        // fs.writeFileSync('./scores.json', gm, 'utf8');

        return new Promise((resolve, reject) => {

            var promises = [];
            gm.players.forEach(player => {
                if (player.games > 1)
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
                        "players": lastGame.players
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

        // players.forEach(element => {
        //     element.games = 0;
        // });

        games.forEach(game => {
            game.players.forEach(gamePlayer => {
                // if (players.find(y => y.name == gamePlayer)) {
                //     players.find(y => y.name == gamePlayer).games++;
                // } else {
                //     players.push({
                //         "name": gamePlayer,
                //         "score": 0,
                //         "games": 1
                //     })
                // }

                gm.amount_total_players++;
            })
        })

        return gm;
    }

};
