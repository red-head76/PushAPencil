const socket = io();

window.addEventListener("load", load);

socket.on("new game lobby", function(game_code) {
    // gets a new game code from the server and prints it to screen
    const game_code_span = document.getElementById("game-code");
    const code = document.createTextNode(game_code);
    game_code_span.appendChild(code);    
});

socket.on("users in room", function(users) {
    users.forEach(user => createUserNameInList(user.user_name));
});

function load() {
    // append the username of the lobby creator to the list
    const url = new URL(window.location.href);
    const user_name = url.searchParams.get("user-name");
    const game_code = url.searchParams.get("game-code");
    createUserNameInList(user_name);
    
    if (game_code) {
        // user clicked on join room and passed therfore a game code
        socket.emit("join game lobby", game_code, user_name);
        
        // write game code to span
        const game_code_span = document.getElementById("game-code");
        const code = document.createTextNode(game_code);
        game_code_span.appendChild(code);
    } else {
        // user clicked on create room = no game code exists
        socket.emit("new game lobby", user_name);
    }
}

function createUserNameInList(user_name) {
    const user_list = document.getElementById("users");
    const new_user = document.createTextNode(user_name);
    const new_user_entry = document.createElement("li");
    
    new_user_entry.className = "list-group-item";
    new_user_entry.appendChild(new_user);
    user_list.appendChild(new_user_entry);
}
    
