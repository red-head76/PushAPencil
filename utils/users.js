const users = [];
const user_has_finished = {};

// TODO: make a database

function userJoin(id, user_name, room) {
    
    user_has_finished[id] = false;
    finished = false;
    
    const user = { id, user_name, room };
    
    // TODO: const ids to make this test work
    if (!users.includes(user)) {
        users.push(user);
        return user;
    }
}

function userFinished(id) {
    user_has_finished[id] = true;
}

function gameFinished(game_code) {
    
    players = getAllUsersInRoom(game_code);
    game_finished = true;
    
    for (var i = 0; i < players.length; i++) {
        if (!user_has_finished[players[i].id]) {
            game_finished = false;
        }
    }
    
    return game_finished;
}

function getAllUsersInRoom(game_code) {
    return users.filter(user => user.room === game_code);
}

function userExists(id) {
    return users.find(user => user.id === id);
}

function userLeave(id) {
    const user = users.find(user => user.id === id);
    const index = users.indexOf(user);
    users.splice(index, 1);
}

function getGameCode(id) {
    const user = users.find(user => user.id === id);
    return user.room;
}

module.exports = {
    userJoin, 
    getAllUsersInRoom,
    userLeave,
    getGameCode,
    userExists,
    userFinished,
    gameFinished,
}
