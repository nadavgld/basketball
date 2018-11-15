const newScoreSystem = require('./scoreCalculation');

module.exports = {
    _subscriptions: [],
    _latestGame: null,

    newPointsCalculation: function (game, startPoint) {
        var res = newScoreSystem.getScore(startPoint, game);

        var scores = res.scores;
        var _text = res._text;
        this._latestGame = _text

        scores = newScoreSystem.sortResult(scores)

        return { scores, _text };

    },
    convertGameToPoints: function (game) {
        var result = [];
        var maxScore;
        var withZero;
        var idx = 0;

        if (game.length % 2 == 0) {
            maxScore = game.length / 2
            withZero = false;
        } else {
            maxScore = Math.floor(game.length / 2)
            withZero = true;
        }

        for (var i = maxScore; i >= -maxScore; i--) {

            if (!withZero && i == 0)
                continue;

            result[idx] = {
                "player": game[idx],
                "score": i
            }

            idx++;
        }

        return result;
    },

    calculateSTD: function (games, n) {

        return new Promise((resolve, reject) => {

            var total_std = 0;

            games.forEach(game => {
                var res = this.newPointsCalculation(game.players, game.startPoint)
                var scores = res.scores;

                scores.forEach(s => {
                    total_std += Math.pow(s.score, 2)
                })
            })

            resolve(Math.sqrt((total_std / n)))
        })

    },

    standardizedScores: function (games, std) {

        return new Promise((resolve, reject) => {

            var result = [];
            games.forEach(game => {
                var res = this.newPointsCalculation(game.players, game.startPoint)
                var scores = res.scores;
                var _text = res._text;

                game.text = _text;

                scores.forEach(s => {
                    if (result[s.player]) {
                        result[s.player] += (s.score / std);
                    } else {
                        result[s.player] = (s.score / std)
                    }
                })
            })
            resolve(this.MinMaxStandart(result, games))

        })
    },

    MinMaxStandart: function (scores, games) {
        var min = Number.MAX_VALUE;
        var max = Number.MIN_VALUE;
        var result = [];

        Object.keys(scores).forEach(key => {
            var s = scores[key]

            if (s < min)
                min = s;
            if (s > max)
                max = s;
        })

        Object.keys(scores).forEach(key => {
            var s = scores[key]

            this.calculateTotalGamesPerPlayer(games, key).then((amountOfGames) => {
                result.push({
                    "name": key,
                    "score": (s + (max - min)),
                    "games": amountOfGames
                })
            })
        })

        return result;
    },

    calculateTotalPlayers: function (games) {
        return new Promise((resolve, reject) => {

            var result = 0;
            games.forEach(game => {
                result += game.players.length;
            })
            resolve(result)

        })
    },

    calculateTotalGamesPerPlayer: function (games, name) {
        return new Promise((resolve, reject) => {

            var result = 0;
            games.forEach(game => {
                if (game.players.indexOf(name) > -1)
                    result++;
            })
            resolve(result)

        })
    },

    pushMsg: function(webPush, msg){
        const PAYLOAD = JSON.stringify({ title: 'Siemens Basketball', body: msg })

        this._subscriptions.forEach(sub => {
            webPush.sendNotification(sub, PAYLOAD).catch(err => console.log(err))
        })
    }
};