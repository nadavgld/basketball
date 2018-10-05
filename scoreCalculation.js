const endPoint = ["Tal z","Nadav g","Beyonce","Linoy","Nir m","Assaf","Ofir"];
const startPoint = randomize(endPoint);

console.log("start: " + startPoint)
console.log("end: " + endPoint)

var scores = calculateScores(startPoint, endPoint);
console.log(scores.sort((a,b)=> a.score < b.score))

function calculateScores(start, end){
        var scores = initScores(start)
        var gamePlay = JSON.parse(JSON.stringify(start))

        end.reverse().forEach(player => {
            if(gamePlay.length == 1){
                console.log("game is over, " + player + " has won")
                return scores;
            }

            const playerIndex = gamePlay.indexOf(player)
            const kickingIndex = playerIndex - 1 >= 0 ? playerIndex - 1 : gamePlay.length - 1;

            var kickingPlayer = gamePlay[kickingIndex];

            console.log( kickingPlayer + ' just kicked ' + player);
            gamePlay.splice(playerIndex, 1)

            scores.find(p => p.name == kickingPlayer).score++
            scores.find(p => p.name == player).score--
            
        })

        return scores;
}

function initScores(start){
    var scores = [];

    start.forEach( player => {
        scores.push({
            "name": player,
            "score": 0
        })
    })

    return scores;
}

function randomize(arr){
    var tempArr = JSON.parse(JSON.stringify(arr));

    var result = []

    while(tempArr.length > 0){
        const rand = Math.floor(Math.random() * tempArr.length);
        const player = tempArr.splice(rand,1);

        result.push(player[0])
    }

    return result
}