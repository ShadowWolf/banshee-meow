"use strict";
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const readline = require('readline');
const {google} = require('googleapis');

class ReservationName {
    constructor(first, last) {
        this.hasName = !!(first && last);

        if (this.hasName) {
            this.first = first;
            this.last = last;
        }
    }

    getName() {
        if (this.hasName)
            return `${this.first} ${this.last}`;
        else
            return "";
    }
}

class Reservation {
    constructor (leftGuest, rightGuest) {
        this.leftGuest = leftGuest;
        this.rightGuest = rightGuest;
    }

    hasName(nameToFind) {
        return false;
    }

    getNames() {
        let names = this.leftGuest.getName();
        if (this.rightGuest.hasName) {
            names = `${names} and ${this.rightGuest.getName()}`;
        }

        return names;
    }
}

class GuestList {

    constructor() {
        this.SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
        this.TOKEN_PATH = 'credentials.json';
        this.CLIENT_ID = 'client_id.json';
    }

    listGuests() {
        return this._run()
            .then(creds => this._authorize(creds))
            .then(auth => {
                if (!auth) throw new Error("No Auth data found");
                const sheets = google.sheets({version: 'v4', auth});
                return sheets.spreadsheets.values.get({
                    spreadsheetId: '1IVae1Xg-oe1GD_c8ho4_l9cdhMzt92HAiCxzlfdKUo0',
                    range: 'Guest List!A2:K'
                });
            })
            .then(sheet => {
                const data = sheet.data;
                const rows = data.values;
                if (rows.length) {
                    return Promise.all(rows.map(row => {
                        const [leftFirst, leftLast, rightFirst, rightLast, street, city, state, zip, relationship, invites] = row;
                        const left = new ReservationName(leftFirst, leftLast);
                        const right = new ReservationName(rightFirst, rightLast);
                        return (new Reservation(left, right));
                    }));
                } else {
                    console.log('No data found');
                }
            });
    }

    _run() {
        return fs.readFileAsync(this.CLIENT_ID)
            .then(content => JSON.parse(content));
    }

    _authorize(credentials) {
        const { client_secret, client_id, redirect_uris } = credentials.web;
        if (!redirect_uris) {
            throw new Error('no redirect urls');
        }

        const oauth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        return fs.readFileAsync(this.TOKEN_PATH)
            .then(token => {
                console.log(`Token: ${token}`);
                oauth.setCredentials(JSON.parse(token));
                return oauth;
            })
            .catch(err => {
                console.log("Getting new token: " + err);
                return this._getNewToken(oauth)
            });
    }

    _getNewToken(oauthClient) {
        return new Promise((resolve, reject) => {
            const authUrl = oauthClient.generateAuthUrl({
                access_type: 'offline',
                scope: this.SCOPES
            });

            console.log(`Authorize this app by visiting this url: ${authUrl}`);

            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.question('Enter the code from that page here:', code => {
                rl.close();
                oauthClient.getToken(code, (err, token) => {
                    if (err) {
                        console.log(`Error getting token: ${err}`);
                        reject(err);
                    }

                    oauthClient.setCredentials(token);
                    fs.writeFile(this.TOKEN_PATH, JSON.stringify(token), err => {
                        if (err) reject(err);
                        resolve(oauthClient);
                    });
                });
            });
        });
    };
}

module.exports = GuestList;