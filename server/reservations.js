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
                let rsvps = [];

                for (let r of result.rows) {
                    r.detail_html = `
        <h4 style="color: #19254d;" >
            ${r.display_name}
        </h4>

        <div class="form-group">
            <div class="form-control" style="border: 0px">
        <label for="attendance-${r.guest_id}">Attending?</label>        
        <select class="custom-select rsvp-selection-attending" style="margin-left: 15px" placeholder="Attendance" id="attendance-${r.guest_id}">            
            <option value="2" ${r.gueststatus_id === 2 ? "selected" : ""}>Attending</option>
            <option value="3" ${r.gueststatus_id === 3 ? "selected" : ""}>Regrets</option>
        </select>
        </div>
        <div class="form-control" style="border: 0px">
        <label for="food-${r.guest_id}">Food Choice?</label>
        <select class="custom-select rsvp-food-selection" style="margin-left: 5px" id="food-${r.guest_id}" required>
            <option value="1" ${r.foodchoice_id === 1 ? "selected" : ""}>Fish</option>
            <option value="2" ${r.foodchoice_id === 2 ? "selceted" : ""}>Filet</option>
            <option value="3" ${r.foodchoice_id === 3 ? "selected" : ""}>Chicken</option>            
        </select>
        </div>
        </div>
`;
                    rsvps.push(r);
                }

                return rsvps;
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