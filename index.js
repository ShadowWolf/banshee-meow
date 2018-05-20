const sheets = require('./server/sheets');
const express = require('express', '4.16.2');
const compression = require('compression');
const app = express();

app.use(express.static('public'));
app.use(compression());

const portNumber = process.env.PORT || 1500;

app.listen(portNumber, () => console.log('Banshee Meow listening on port ' + portNumber + ' PORT environment variable: ' + process.env.PORT));

app.get('/api/rsvp', (req, res) => {
    //res.send("Can I help you?");
    const s = new sheets();

    let items = [];

    s.listGuests((row) => {
        console.log(row);
        items.push(row);
    });

    res.send(JSON.stringify(items));
});

app.post('/api/rsvp', (req, res) => {

});