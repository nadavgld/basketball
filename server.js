var express = require('express')
var bodyParser = require('body-parser')
var cors = require('cors')
var md5 = require('md5');

const PSSWRD = "2eec8c77e2944a566e823d55b19207f7";

var IO = require('./io')
var Utilities = require('./utils')

var app = express()
app.use(cors())
var scoresFetchInterval;

const port = process.env.PORT || 5000
var std;

var _gameManager = {};
IO.readDB().then((gm) => {
    console.log("game manager is ready");
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
        console.log("game manager is ready");
        _gameManager = gm;
        res.send(_gameManager.players)
    })
    // try {
    // } catch (e) { }
})

app.get('/players', (req, res) => {
    IO.readDB().then((gm) => {
        console.log("game manager is ready");
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
    var date = new Date().toLocaleString();

    _gameManager.games.push({
        "date": date,
        "players": players
    });

    console.log(JSON.stringify(_gameManager.players));
    _gameManager.amount_total_players += players.length;

    Utilities.calculateSTD(_gameManager.games, _gameManager.amount_total_players).then(_std => {
        std = _std;

        Utilities.standardizedScores(_gameManager.games, std).then((result) => {
            _gameManager.players = result;
            _gameManager = IO.countGamesPerPlayer(_gameManager);

            // IO.writeDB(JSON.stringify(_gameManager));
            IO.writeDB(_gameManager).then(()=>{  
                res.send({"scores":_gameManager.players,"players":_gameManager.players.map(s => s.name)});
            });
        })
    })

})

// scoresFetchInterval = setInterval(() => {
//     IO.readDB().then((gm) => {
//         console.log("game manager is ready");
//         _gameManager = gm;
//     })
// }, 5000)



app.listen(port, () => console.log('app is up'))