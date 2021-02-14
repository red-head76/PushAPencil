 const path = require('path');
const http = require('http');
const express = require('express');
const socket = require('socket.io');
const { userJoin, getAllUsersInRoom, userLeave } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socket(server);

const PORT = process.env.PORT || 5000;

const rooms = [];

// set the path to frontend folder
app.use(express.static(path.join(__dirname, 'frontend')));

// listen o connection event, this occures every time a new user connects
// to the website
io.on('connection', function (socket) {
    // TODO prevent on reload game lobby
    socket.on('new game lobby', function(user_name) {
        const game_code = newGameId();
        const user = userJoin(socket.id, user_name, game_code);
        
        // join the user to a new room
        socket.join(game_code);
        
        // emit to all clients, alternatives:
        // io.broadcast.emit -> to all clients except the client thats connecting
        // socket.emit -> only the client thata connecting
        socket.emit('new game lobby', game_code);
    });
    
    socket.on('join game lobby', function(game_code, user_name) {
        if (rooms.includes(game_code)) {
            socket.join(game_code);
            socket.to(game_code).broadcast.emit('join game lobby', user_name);
            socket.emit('users in room', getAllUsersInRoom(game_code));
            const user = userJoin(socket.id, user_name, game_code);
        } else {
            socket.emit('no game lobby');
        }
    });
    
    socket.on('disconnect', function() {
        // TODO only make this on disconnect from lobby
        userLeave(socket.id);
    });
});

function newGameId() {
    // TODO: prevent a runtimererror if all or the majority of rooms is full
    var search = true;
    
    while (search) {
        var result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for ( var i = 0; i < 6; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        
        if (!rooms.includes(result)) {
            search = false;
            rooms.push(result);
            return result;
        }
    }
}

server.listen(PORT);
