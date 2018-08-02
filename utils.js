module.exports = {

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
                var scores = this.convertGameToPoints(game.players)

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
                var scores = this.convertGameToPoints(game.players)

                scores.forEach(s => {
                    if (result[s.player]) {
                        result[s.player] += (s.score / std);
                    } else {
                        result[s.player] = (s.score / std)
                    }
                })
            })
            console.log(result);
            resolve(this.MinMaxStandart(result))

        })
    },

    MinMaxStandart: function (scores) {
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

            result.push({
                "name": key,
                "score": (s + (max-min))
            })
        })

        return result;
    }
};