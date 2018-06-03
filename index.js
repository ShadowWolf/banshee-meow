const rsvp = require('./server/reservations');
const express = require('express', '4.16.2');
const compression = require('compression');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const logger = require('heroku-logger');

const jsonParser = bodyParser.json();

app.use(express.static('public', {maxAge: '10 days'}));
app.use(compression());
app.use(jsonParser);
app.use(cookieParser());

const portNumber = process.env.PORT || 1500;

app.listen(portNumber, () => logger.info('Banshee Meow listening on port ' + portNumber + ' PORT environment variable: ' + process.env.PORT));


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
       .then(details => res.json(details))
       .catch(err => logger.error(err));
});

app.get('/api/food', (req, res) => {
    const r = new rsvp();
    return r.getFoodOptions()
        .then(fo => res.send(fo));
});

app.post('/api/rsvp', jsonParser, (req, res) => {
    if (!req.body) {
        return res.status(400).send("No message provided").end();
    }

    if (!req.cookies
        || !req.cookies.hasOwnProperty('reservationId')) {
        return res.status(400).send("Invalid request data").end();
    }

    let reservationId = req.cookies.reservationId;
    if (!reservationId || reservationId === "undefined") {
        return res.status(400).send("Missing reservation id").end();
    }

    logger.info(`reservation id: ${reservationId}`);

    let data = req.body.data;
    logger.info(data);

    if (!Array.isArray(data)) {
        return res.status(400).send("Not an Array").end();
    }

    const r = new rsvp();
    r.updateGuests(reservationId, data)
        .then(msg => {
            return res.json({message: msg}).end();
        },
        err => {
            logger.error("Error: " + err);
            return res.status(500).send('failed to update').end();
        });

});