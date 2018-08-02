var fs = require('fs')

module.exports = {

    readDB: function () {
        var scores = JSON.parse(fs.readFileSync('./scores.json', 'utf8'));

        return this.countGamesPerPlayer(scores);
    },

    writeDB: function (data) {
        fs.writeFileSync('./scores.json', data, 'utf8');
    },
    
    countGamesPerPlayer: function (gm) {
        var players = gm.players;
        var games = gm.games;

        players.forEach(element => {
            element.games = 0;
        });

        games.forEach(game => {
            game.players.forEach(gamePlayer => {
                if (players.find(y => y.name == gamePlayer)) {
                    players.find(y => y.name == gamePlayer).games++;
                } else {
                    players.push({
                        "name": gamePlayer,
                        "score": 0,
                        "games": 1
                    })
                }
            })
        })

        return gm;
    }

};
