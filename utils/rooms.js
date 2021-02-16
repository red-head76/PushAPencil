// TODO make database

const rooms = [];
const in_game_rooms = [];

function newGameId(game_code) {
    // TODO: prevent a runtimererror if all or the majority of rooms is full
    var search = true;
    
    while (search) {
        var result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for ( var i = 0; i < 6; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        
        if (!gameExists(result)) {
            search = false;
            rooms.push(result);
            return result;
        }
    }
}

function gameExists(game_code) {
    return rooms.includes(game_code);
}

function newInGameRoom(game_code, player_list) {
    // TODO shuffle player list
    if (gameExists(game_code)) {
        in_game_room = { game_code, player_list };
        in_game_rooms.push(in_game_room);
    }
}

function nextPlayer(id, game_code) {
    const room = in_game_rooms.find(game => game.game_code === game_code);
    player = room.player_list.find(player => player.id === id);
    player_index = room.player_list.indexOf(player)
    
    if (player_index != room.player_list.length - 1) {
        return room.player_list[player_index + 1];
    } else {
        return room.player_list[0];
    }
}

module.exports = {
    newGameId,
    gameExists,
    newInGameRoom,
    nextPlayer,
}
