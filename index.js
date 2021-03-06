const path = require('path');
const http = require('http');
const express = require('express');
const socket = require('socket.io');
const { userJoin, getAllUsersInRoom, userLeave, getGameCode, userExists, userFinished, gameFinished } = require('./utils/users');
const { newGameId, gameExists, newInGameRoom, nextPlayer, roomInGame } = require('./utils/rooms');
const { saveTasks, loadTasks } = require('./utils/tasks');

const app = express();
const server = http.createServer(app);
const io = socket(server);

const PORT = process.env.PORT || 5000;

// set the path to frontend folder
app.use(express.static(path.join(__dirname, 'frontend')));

// listen o connection event, this occures every time a new user connects
// to the website
io.on('connection', function (socket) {
    // TODO remember disconeccted users by name and game code and put them back in place (users, in_game_rooms)
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
        if (roomInGame(game_code)) {
            // TODO make a "lobby is in game" funciton
            socket.emit("no game lobby");
        } else if (gameExists(game_code)) {
            socket.join(game_code);
            socket.to(game_code).broadcast.emit('join game lobby', user_name);
            socket.emit('users in room', getAllUsersInRoom(game_code));
            const user = userJoin(socket.id, user_name, game_code);
        } else {
            socket.emit("no game lobby");
        }
    });
    
    socket.on("push task", function(type, task, user_name, game_code) {
        socket.to(nextPlayer(socket.id, game_code).id).emit("next task", type, task);
        saveTasks(user_name, task, game_code)
    });
        
    socket.on("game start", function(game_code) {
        const numberOfPlayers = getAllUsersInRoom(game_code).length;
        io.to(game_code).emit("game start", numberOfPlayers);
        const player_list = getAllUsersInRoom(game_code);
        const in_game_room = newInGameRoom(game_code, player_list);
    });
    
    socket.on("finished", function(game_code) {
        userFinished(socket.id);
        if (gameFinished(game_code)) {
            users = getAllUsersInRoom(game_code);
            tasks = loadTasks(users, game_code);
            io.to(game_code).emit("game finished", tasks);
        }
    });
    
    socket.on('disconnect', function() {
        // TODO check if the room is empty and close it if so
        if (userExists(socket.id)) { 
            game_code = getGameCode(socket.id);
            userLeave(socket.id);
            socket.to(game_code).broadcast.emit('user leave', getAllUsersInRoom(game_code));
        }
    });
});

server.listen(PORT);
