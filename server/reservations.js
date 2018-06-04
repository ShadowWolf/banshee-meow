const { Client } = require('pg');
const logger = require('heroku-logger');

class Reservations {
    constructor() {
        if (!process.env.DATABASE_URL) {
            logger.error('No database connection provided - need DATABASE_URL environment variable');
            throw new Error('No connection string');
        }

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
        <div guest-id="${r.guest_id}">        
            <h4 style="color: #19254d;" >
                ${r.display_name}
            </h4>
    
            <div class="form-group">
                <div class="form-control" style="border: 0px">
            <label for="attendance-${r.guest_id}">Attending?</label>        
            <select class="custom-select rsvp-selection-attending" style="margin-left: 18px" id="attendance-${r.guest_id}">      
                <option value="2" ${r.gueststatus_id === 2 ? "selected" : ""}>Attending</option>
                <option value="3" ${r.gueststatus_id === 3 ? "selected" : ""}>Regrets</option>
            </select>
            </div>
            <div class="form-control" style="border: 0px">
            <label for="food-${r.guest_id}">Food Choice?</label>
            <select class="custom-select rsvp-food-selection" style="margin-left: 5px" id="food-${r.guest_id}" required>
                <option value="1" ${r.foodchoice_id === 1 ? "selected" : ""}>Walleye</option>
                <option value="2" ${r.foodchoice_id === 2 ? "selected" : ""}>Beef Filet</option>
                <option value="3" ${r.foodchoice_id === 3 ? "selected" : ""}>Chicken</option>            
            </select>
            </div>
            </div>
        </div>
`;
                    rsvps.push(r);
                }

                return rsvps;
            });
    }

    verifyGuest(guestDetail) {
        if (!guestDetail.hasOwnProperty("guestId") ||
            !guestDetail.hasOwnProperty("foodId") ||
            !guestDetail.hasOwnProperty("attendanceId")) {
            throw new Error("Missing Detail for Guest Data");
        }

        if (!guestDetail.guestId) {
            throw new Error("Missing guest id");
        }

        if (!guestDetail.attendanceId) {
            throw new Error("Missing attendance status");
        }

        if (!guestDetail.foodId) {
            throw new Error("Missing food selection");
        }
    };


    updateGuests(reservationId, guestDetails) {
        if (!reservationId) {
            throw new Error("Missing reservation id");
        }

        logger.info(`Updating ${guestDetails.length} guests`);

        const valueSets = [];

        for (let g of guestDetails) {
            this.verifyGuest(g);
            valueSets.push([
                g.guestId,
                g.foodId,
                g.attendanceId
            ]);
        }


        const updatePromises = [];

        return this.connect()
            .then(() => {
                for (let values of valueSets) {
                    logger.info("Updating guest " + values[0]);
                    updatePromises.push(this.client.query("UPDATE rsvp.guests" +
                        " SET " +
                        "   foodchoice_id = $2," +
                        "   gueststatus_id = $3" +
                        "  WHERE id = $1", values));
                }})
            .then(() => Promise.all(updatePromises))
            .then(() => this.getFinishMessage(reservationId));
    }

    getFinishMessage(reservationId) {
        logger.info("Getting finish message");
        return this.client.query("select " +
            "  reservation_id, " +
            "  wedding_party, " +
            "  invite_count, " +
            "  status_id, " +
            "  rehersal_dinner, " +
            "  display " +
            "from rsvp.view_reservationstatus where reservation_id = $1", [reservationId])
            .then(result => {
                this.client.end();
                if (result.rows.length > 1) {
                    throw new Error("More than 1 result for reservation " + reservationId);
                }

                let finishSections = [];
                let reservation = result.rows[0];

                finishSections.push({
                    id: "wedding-thank-you",
                    text: "Thank you for RSVPing!"
                });

                if (reservation.status_id === 2) {
                    logger.info(`Completed reservation ${reservation.reservation_id}`);

                    if (reservation.wedding_party) {
                        finishSections.push({
                            id: "wedding-party",
                            text: "A high level wedding day schedule for the wedding party and family will be sent out soon."
                        });
                    }

                    if (reservation.rehersal_dinner) {
                        finishSections.push({
                            id: "rehersal-dinner",
                            text: "Our rehersal dinner is planned at 7:30PM on Friday - details to come!"
                        });
                    }

                    finishSections.push({
                        id: "wedding-complete",
                        text: "We look forward to seeing you at our wedding!"
                    });

                } else if (reservation.status_id === 3) {
                    logger.info(`reservation ${reservation.reservation_id} declined`);
                    finishSections.push({
                        id: "wedding-regrets",
                        text: "We're sorry to hear you can't make it! Please let us know if there's a change in plans right away."
                    })
                }

                logger.info("finish messages: " + JSON.stringify(finishSections));

                return finishSections.map(s => `
<div id="${s.id}">
    <p class="mb20">${s.text}</p>
</div>`).join("\n");
            }, err => logger.error(err));
    }

    findReservation(name) {
        name = name.split(' ').join('%');

        return this.connect()
            .then(() => this.client.query("SELECT reservation_id, fullname " +
                "FROM rsvp.view_findreservation " +
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
                    let result = rows[0];
                    return {
                        reservation_id: result.reservation_id,
                        full_name: result.fullname
                    };
                }
            })
    }
}




module.exports = Reservations;