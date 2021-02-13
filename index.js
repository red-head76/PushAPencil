const path = require('path');
const http = require('http');
const express = require('express');
const socket = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socket(server);

const PORT = process.env.PORT || 5000;

// set the path to frontend folder
app.use(express.static(path.join(__dirname, 'frontend')));

// listen o connection event, this occures every time a new user connects
// to the website
io.on('connection', function (socket, name) {
  io.emit('user join', { for: 'everyone'});
  console.log('new user connected');
});

server.listen(PORT);
