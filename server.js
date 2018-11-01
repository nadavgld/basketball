var express = require('express')
var bodyParser = require('body-parser')
var cors = require('cors')
var md5 = require('md5');

const PSSWRD = "0cc175b9c0f1b6a831c399e269772661";

var IO = require('./io')
var Utilities = require('./utils')

var app = express()
app.use(cors())
var scoresFetchInterval;

const port = process.env.PORT || 5000
var std;

var _gameManager = {};
IO.readDB().then((gm) => {
    _gameManager = gm;
})

app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send("Welcome")
})

app.get('/scores', (req, res) => {
    IO.readDB().then((gm) => {
        _gameManager = gm;
        res.send(_gameManager.players)
    })
    // try {
    // } catch (e) { }
})

app.get('/players', (req, res) => {
    IO.readDB().then((gm) => {
        _gameManager = gm;
        res.send(_gameManager.players.map(s => s.name))
    })
    // try {
    // } catch (e) { }
})

app.get('/games', (req, res) => {
    try {
        res.send(_gameManager.games)
    } catch (e) { }
})

app.get('/password/:ps', (req, res) => {
    var ps = req.params.ps;

    if (md5(ps) == PSSWRD) {
        res.send({ success: true })
    } else {
        res.send({ success: false })
    }
})

app.post('/games', (req, res) => {
    var players = req.body.players;
    var startPlayers = req.body.start;

    var date = new Date().toLocaleString();

    var playersToAdd = []
    players.forEach(p => {
        if(_gameManager.players.map(_p => p.name).indexOf(p) == -1){
            playersToAdd.push(p)
        }
    });

    playersToAdd.forEach( p => {
        _gameManager.players.push({
            "name": p,
            "score": 0,
            "games": 1
        })
    })

    _gameManager.games.push({
        "date": date,
        "players": players,
        "startPoint": startPlayers
    });

    _gameManager.amount_total_players += players.length;

    Utilities.calculateSTD(_gameManager.games, _gameManager.amount_total_players).then(_std => {
        std = _std;

        Utilities.standardizedScores(_gameManager.games, std).then((result) => {
            _gameManager.players = result;
            _gameManager = IO.countGamesPerPlayer(_gameManager);

            // IO.writeDB(JSON.stringify(_gameManager));
            IO.writeDB(_gameManager).then(() => {
                res.send({ "scores": _gameManager.players, "players": _gameManager.players.map(s => s.name) });
            });
        })
    })

})

app.listen(port, () => console.log('app is up'))