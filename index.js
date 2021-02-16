const path = require('path');
const http = require('http');
const express = require('express');
const socket = require('socket.io');
const { userJoin, getAllUsersInRoom, userLeave, getGameCode } = require('./utils/users');
const { newGameId, gameExists, newInGameRoom, nextPlayer } = require('./utils/rooms');

const app = express();
const server = http.createServer(app);
const io = socket(server);

const PORT = process.env.PORT || 5000;

const in_game_rooms = [];

// set the path to frontend folder
app.use(express.static(path.join(__dirname, 'frontend')));

// listen o connection event, this occures every time a new user connects
// to the website
io.on('connection', function (socket) {
    // TODO prevent changing game code on reload game lobby
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
        if (gameExists(game_code)) {
            socket.join(game_code);
            socket.to(game_code).broadcast.emit('join game lobby', user_name);
            socket.emit('users in room', getAllUsersInRoom(game_code));
            const user = userJoin(socket.id, user_name, game_code);
        } else {
            socket.emit('no game lobby');
        }
    });
    
    socket.on("starting phrase", function(starting_phrase, game_code) {
        socket.to(nextPlayer(socket.id, game_code).id).emit("starting phrase", starting_phrase);
    });
    
    socket.on("drawing", function(drawing, game_code) {
        socket.to(nextPlayer(socket.id, game_code).id).emit("drawing", drawing);
    });
    
    socket.on("game start", function(game_code) {
        socket.to(game_code).broadcast.emit("game start");
        const player_list = getAllUsersInRoom(game_code);
        const in_game_room = newInGameRoom(game_code, player_list);
    });
    
    socket.on('disconnect', function() {
        game_code = getGameCode(socket.id);
        userLeave(socket.id);
        socket.to(game_code).broadcast.emit('user leave', getAllUsersInRoom(game_code));
    });
});

server.listen(PORT);
