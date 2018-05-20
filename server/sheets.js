const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

class GuestList {

    constructor() {
        this.SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
        this.TOKEN_PATH = 'credentials.json';

    }

    listGuests(rowCallback) {


        return this._run(auth => this.guestsCallback(auth, rowCallback));
    }

    _run(callback) {
        return fs.readFile('client_id.json', (err, content) => {
            if (err)
                return console.log(`Error loading client file: ${err}`);

            this._authorize(JSON.parse(content), callback);
        });
    }

    _authorize(credentials, callback) {
        const {client_secret, client_id, redirect_uris} = credentials.web;
        if (!redirect_uris) {
            throw new Error('no redirect urls');
        }

        const oauth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

        fs.readFile(this.TOKEN_PATH, (err, token) => {
            if (err)
                return this._getNewToken(oauth, callback);

            oauth.setCredentials(JSON.parse(token));
            callback(oauth);
        })
    }

    _getNewToken(oauthClient, callback) {
        const authUrl = oauthClient.generateAuthUrl({
            access_type: 'offline',
            scope: this.SCOPES
        });

        console.log(`Authorize this app by visiting this url: ${authUrl}`);

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();

            oauthClient.getToken(code, (err, token) => {
                if (err)
                    return callback(err);

                oauthClient.setCredentials(token);
                fs.writeFile(this.TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err)
                        throw new Error(err);

                    console.log(`Token stored to ${this.TOKEN_PATH}`);
                });

                callback(oauthClient);
            });
        });
    };

    guestsCallback(auth, rowCallback) {
        const sheets = google.sheets({version: 'v4', auth});
        sheets.spreadsheets.values.get({
            spreadsheetId: '1IVae1Xg-oe1GD_c8ho4_l9cdhMzt92HAiCxzlfdKUo0',
            range: 'Guest List!A:D'
        }, (err, result) => {
            if (err)
                throw err;

            const data = result.data;
            const rows = data.values;
            if (rows.length) {
                rows.map((row) => {
                    rowCallback(row);
                })
            } else {
                console.log('No data found');
            }
        });
    }
}

module.exports = GuestList;