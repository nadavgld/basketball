var fs = require('fs')

module.exports = {

    readScores: function () {
        var scores = JSON.parse(fs.readFileSync('./scores.json', 'utf8'));
        return scores;
    }

};