const { Client } = require('pg');

class Reservations {
    constructor() {
        this.client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: true,
        });
        this.isConnected = false;
    }

    connect() {
        if (this.isConnected)
            return Promise.resolve(true);

        return this.client.connect().then(() =>  this.isConnected = true);

    }

    getReservations() {
        return this.connect()
            .then(() => this.client.query("SELECT * FROM rsvp.view_activereservations"))
            .then(rows => {
                this.client.end();
                return rows;
            });
    }

    getFoodOptions() {
        return this.connect()
            .then(() => this.client.query("SELECT * FROM rsvp.foodchoice"))
            .then(result => {
                this.client.end();
                return result.rows;
            })
    }

    getDetails(reservationId) {
        return this.connect()
            .then(() => this.client.query("SELECT * FROM rsvp.view_reservationdetail WHERE reservation_id = $1", [reservationId]))
            .then(result => {
                this.client.end();
                return result.rows;
            });
    }

    findReservation(name) {
        name = name.split(' ').join('%');

        return this.connect()
            .then(() => this.client.query("SELECT reservation_id\n" +
                "FROM rsvp.view_findreservation\n" +
                "WHERE fullname ilike $1::text", [`%${name}%`]))
            .then(result => {
                this.client.end();
                let rows = result.rows;
                if (!rows || rows.length === 0) {
                    console.log(`Not found: ${name}`);
                    return null;
                } else if (rows.length !== 1) {
                    console.log(`Found ${rows.length} for ${name}`);
                    return {
                        multiple_results: true
                    };
                } else {
                    console.log(`Found reservation ${rows[0].reservation_id} for ${name}`);
                    return rows[0];
                }
            })
    }
}




module.exports = Reservations;