const http = require('http');
const uuid = require('uuid');
const fs = require('fs');
const path = require('path');
const config = require('./config')

const whiteboardPattern = new RegExp('/whiteboard/(.*)');
const jsFilesPattern = new RegExp('/public/js/(.*\.js)');
const cssFilesPattern = new RegExp('/public/css/(.*\.css)');

const rooms = new Array();
const rooms_set = new Set();
const clients = new Map();

const server = http.createServer((req, res) => {

    if (jsFilesPattern.test(req.url)) {
                fs.readFile(path.join(path.dirname(__filename), 'public', 'js', path.basename(req.url)), 'utf8', (err, content) => {
            if (err) {
                res.writeHead(404);
                res.end('File not found')
            }
            res.writeHead(200, { 'Content-Type': 'text/javascript' })
            res.end(content);
        })
    }
    if (cssFilesPattern.test(req.url)) {
        fs.readFile(path.join(path.dirname(__filename), 'public', 'css', path.basename(req.url)), 'utf8', (err, content) => {
            if (err) {
                res.writeHead(404);
                res.end('File not found')
            }
            res.writeHead(200, { 'Content-Type': 'text/css' })
            res.end(content);
        })
    }

    if (req.url == '/') {
        fs.readFile(path.join(path.dirname(__filename), 'public', 'index.html'), 'utf8', (err, content) => {
            if (err) {
                res.writeHead(404);
                res.end('File not found');
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        })
    }

    if (matched = whiteboardPattern.exec(req.url)) {
        if (!rooms_set.has(matched[1])) {
            res.writeHead(404)
            res.end();
        }
        fs.readFile(path.join(path.dirname(__filename), 'public', 'whiteboard.html'), 'utf8', (err, content) => {
            if (err) {
                throw err;
            };
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(content);
        })
    }

    if (req.url == '/create-room') {
        let client_addr = req.connection.remoteAddress;
        if (!clients.has(client_addr)) {
            let room_id = uuid.v4();
            rooms_set.add(room_id);
            rooms.push({ room_id: room_id, ips: [client_addr] })
            clients.set(client_addr, room_id)
            console.log('returning '+room_id)
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ room_id: room_id, err: false, url: `http:\\\\${config.SERVER_HOSTNAME}:${config.PORT}\\whiteboard\\${room_id}` }))
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({
                err: true, room_id: clients.get(client_addr),
                err_msg: "You already have a room"
            }))
        }
        console.log(clients)
    }
})

const websocketServer = http.createServer((req, res)=>{
    if(req.url=='/connect-room'){
        clients.add()
    }
});

const io = require('socket.io')(server);

io.on('connection', (socket) => {
    console.log('new connection');

    socket.on('send-data', (data) => {
        console.log(data);
    })
});
console.log(config.PORT);
server.listen(config.PORT, config.SERVER_HOSTNAME, () => { console.log('Listening on port 5000') });
