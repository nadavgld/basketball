// const endPoint = ["Tal z","Nadav g","Beyonce","Linoy","Nir m","Assaf","Ofir"];
// const startPoint = randomize(endPoint);

// console.log("start: " + startPoint)
// console.log("end: " + endPoint)

// var scores = calculateScores(startPoint, endPoint);
// console.log(scores.sort((a,b)=> a.score < b.score))

function calculateScores(start, _end) {
    var gamePlay = JSON.parse(JSON.stringify(start))
    var scores = initScores(gamePlay)
    var end = JSON.parse(JSON.stringify(_end))
    var _text = "";

    end.reverse().forEach(player => {
        if (gamePlay.length == 1) {
            _text += "<br>game is over, " + player + " has won"
            return {scores,_text};
        }

        const playerIndex = gamePlay.indexOf(player)
        const kickingIndex = playerIndex - 1 >= 0 ? playerIndex - 1 : gamePlay.length - 1;

        var kickingPlayer = gamePlay[kickingIndex];

        _text += "<br>" + kickingPlayer + ' kicked ' + player
        gamePlay.splice(playerIndex, 1)

        scores.find(p => p.player == kickingPlayer).score++
        scores.find(p => p.player == player).score--

    })

    return {scores,_text};
}

function initScores(start) {
    var scores = [];

    start.forEach(player => {
        scores.push({
            "player": player,
            "score": 0
        })
    })

    return scores;
}

function randomize(arr) {
    var tempArr = JSON.parse(JSON.stringify(arr));

    var result = []

    while (tempArr.length > 0) {
        const rand = Math.floor(Math.random() * tempArr.length);
        const player = tempArr.splice(rand, 1);

        result.push(player[0])
    }

    return result
}

function sortResult(arr) {
    return arr.sort((a, b) => a.score < b.score)
}

module.exports.getScore = calculateScores;
module.exports.sortResult = sortResult;
module.exports.randomize = randomize;
