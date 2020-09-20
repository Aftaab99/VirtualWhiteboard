const process = require('process');
const SERVER_ADDR = process.env.SERVER_ADDR || 'localhost:5000';
const PORT = process.env.PORT || 5000;

module.exports = {SERVER_ADDR, PORT};
