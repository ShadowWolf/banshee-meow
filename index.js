const express = require('express', '4.16.2');

const app = express();

app.use(express.static('public'));

const portNumber = 1500;

app.listen(portNumber, () => console.log('Banshee Meow listening on port ' + portNumber))