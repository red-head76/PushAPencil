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

module.exports = {
    userJoin, 
    getAllUsersInRoom,
}
