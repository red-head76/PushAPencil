const users = [];

// TODO: make a database

function userJoin(id, user_name, room) {
    const user = { id, user_name, room };
    
    // TODO: const ids to make this test work
    if (!users.includes(user)) {
        users.push(user);
        return user;
    }
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
}
