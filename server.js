var express = require('express')
var bodyParser = require('body-parser')
var cors = require('cors')

var IO = require('./io')
var Utilities = require('./utils')

var app = express()
app.use(cors())
var scoresFetchInterval;

const port = process.env.PORT || 8080
var std;

var _gameManager = IO.readDB()

app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send("Welcome")
})

app.get('/scores', (req, res) => {
    res.send(_gameManager.players)
})

app.get('/players', (req, res) => {
    res.send(_gameManager.players.map(s => s.name))
})

app.get('/games',(req,res) => {
    res.send(_gameManager.games)
})

app.post('/games',(req,res) => {
    var players = req.body.players;
    var date = new Date().toLocaleString();

    _gameManager.games.push({
        "date": date,
        "players": players
    });

    _gameManager.amount_total_players += players.length;

    Utilities.calculateSTD(_gameManager.games, _gameManager.amount_total_players).then(_std => {
        std = _std;
        console.log(std);

        Utilities.standardizedScores(_gameManager.games, std).then((result)=>{
            _gameManager.players = result;
            _gameManager = IO.countGamesPerPlayer(_gameManager);

            IO.writeDB(JSON.stringify(_gameManager));

            res.send(_gameManager.players);
        })
    })

})

// scoresFetchInterval = setInterval(() => {
//     _gameManager = IO.readDB()
// }, 5000)



app.listen(port,() => console.log('app is up'))