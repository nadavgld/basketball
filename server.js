var express = require('express')
var bodyParser = require('body-parser')
var cors = require('cors')

var IO = require('./io')

var app = express()
app.use(cors())
var scoresFetchInterval;

const port = 3333


var _scores = IO.readScores()

app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send("Welcome")
})

app.get('/scores', (req, res) => {
    res.send(_scores.players)
})

app.get('/players', (req, res) => {
    res.send(_scores.players.map(s => s.name))
})

scoresFetchInterval = setInterval(() => {
    _scores = IO.readScores()
}, 5000)



app.listen(port, '0.0.0.0', () => console.log('app is up'))