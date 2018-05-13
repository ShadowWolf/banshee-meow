const express = require('express', '4.16.2');

const app = express();

app.use(express.static('public'));

const portNumber = process.env.PORT || 1500;

app.listen(portNumber, () => console.log('Banshee Meow listening on port ' + portNumber + ' PORT environment variable: ' + process.env.PORT));

app.get('/api/rsvp', (req, res) => {
    //res.send("Can I help you?");

});

app.post('/api/rsvp', (req, res) => {

});