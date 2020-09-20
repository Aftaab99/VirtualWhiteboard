const http = require('http');
const uuid = require('uuid');
const fs = require('fs');
const path = require('path');
const config = require('./config')

const whiteboardPattern = /\/whiteboard\?roomId=(.*)/
const jsFilesPattern = /\/public\/js\/(.*\.js)/  //new RegExp('/public/js/(.*\.js)');
const cssFilesPattern = /\/public\/css\/(.*\.css)/
const imagesPattern = /\public\/images\/(.*\.svg)/

const rooms = new Array();
const latestRoomState = new Map();
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
        });
    }
    else if (cssFilesPattern.test(req.url)) {
        fs.readFile(path.join(path.dirname(__filename), 'public', 'css', path.basename(req.url)), 'utf8', (err, content) => {
            if (err) {
                res.writeHead(404);
                res.end('File not found')
            }
            res.writeHead(200, { 'Content-Type': 'text/css' })
            res.end(content);
        })
    }

    else if (req.url == '/') {
        fs.readFile(path.join(path.dirname(__filename), 'public', 'index.html'), 'utf8', (err, content) => {
            if (err) {
                res.writeHead(404);
                res.end('File not found');
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        })
    }

    else if (matched = whiteboardPattern.exec(req.url)) {
        console.log('whiteboard fine.....\n\n\n\n')
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

    else if (req.url == '/create-room') {
        let client_addr = req.connection.remoteAddress;
        if (!clients.has(client_addr)) {
            let room_id = uuid.v4();
            rooms_set.add(room_id);
            rooms.push({ room_id: room_id, ips: [client_addr] })
            clients.set(client_addr, room_id)
            console.log('returning ' + room_id)
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ room_id: room_id, err: false, url: `${config.SERVER_ADDR}/whiteboard?roomId=${room_id}` }))
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({
                err: true, room_id: clients.get(client_addr),
                err_msg: "You already have a room"
            }))
        }
    }

    else if(imagesPattern.exec(req.url)){
        fs.readFile(path.join(path.dirname(__filename), 'public', 'images', path.basename(req.url)), 'utf8', (err, content) => {
            if (err) {
                res.writeHead(404);
                res.end('File not found')
            }
            res.writeHead(200, { 'Content-Type': 'image/svg+xml' })
            res.end(content);
        });
    }
    else{
        res.writeHead(404);
        res.end('Requested path or file not found');
    }
});

const io = require('socket.io')(server);

io.on('connection', (socket) => {
    socket.on('create-room', (roomId) => {
        socket.join(roomId);
        if (latestRoomState.has(roomId)) {
            socket.emit('set-initial-whiteboard', latestRoomState.get(roomId));
        }
    })

    socket.on('send-data', (data) => {
        latestRoomState.set(data.roomId, data.data);
        socket.broadcast.to(data.roomId).emit('receive-data', data);
    });
});

server.listen(config.PORT, '0.0.0.0', () => { console.log('Listening on port 5000') });
