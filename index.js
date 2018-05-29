//const sheets = require('./server/sheets');
const rsvp = require('./server/reservations');
const express = require('express', '4.16.2');
const compression = require('compression');
const app = express();

app.use(express.static('public', {maxAge: '10 days'}));
app.use(compression());

const portNumber = process.env.PORT || 1500;

app.listen(portNumber, () => console.log('Banshee Meow listening on port ' + portNumber + ' PORT environment variable: ' + process.env.PORT));

app.get('/api/full_rsvp_set', (req, res) => {
    const s = new rsvp();

    return s.getReservations().then(result => {
        res.send(result.rows);
    })
});

app.get('/api/rsvp', (req, res) => {
    if (!req.query.name) {
        return res.sendStatus(400);
    }

    const r = new rsvp();
    return r.findReservation(req.query.name).then(row => {
        if (!row) {
            return res.sendStatus(404);
        } else if (row.hasOwnProperty('multiple_results')) {
            res.status(401).send(row);
        } else {
            return res.send(row);
        }
    })
});

app.get('/api/rsvp/:id', (req, res) => {
   if (!req.params.id) {
       return res.sendStatus(400);
   }

   const r = new rsvp();
   return r.getDetails(req.params.id)
       .then(details => res.send(details));
});

app.get('/api/food', (req, res) => {
    const r = new rsvp();
    return r.getFoodOptions()
        .then(fo => res.send(fo));
});

app.post('/api/rsvp', (req, res) => {

});