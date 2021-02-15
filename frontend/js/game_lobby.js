const socket = io();

window.addEventListener("load", load);

const url = new URL(window.location.href);
const user_name = url.searchParams.get("user-name");
const game_code = url.searchParams.get("game-code");
    
// to handle disconnects different if the game has game has started
var game_started = false;

const start_btn = document.getElementById("start-btn");
start_btn.addEventListener("click", function() {
    socket.emit("game start", game_code);
    startGame();
});

// server communication in user lobby
// _______________________________________________________________________________________________
socket.on("new game lobby", function(game_code) {
    // gets a new game code from the server and prints it to screen
    const game_code_span = document.getElementById("game-code");
    const code = document.createTextNode(game_code);
    game_code_span.appendChild(code);    
});

socket.on("users in room", function(users) {
    users.forEach(user => createUserNameInList(user.user_name));
    
    // append the user itself after all users that where already here
    createUserNameInList(user_name);    
});

socket.on("join game lobby", function(user_name) {
    createUserNameInList(user_name);
});

socket.on("no game lobby", function() {
    window.location.href = "index.html?user-name=" + user_name + "&game-code=" + game_code;
});

socket.on("user leave", function(remaining_users) {
    if (!game_started) {
        const user_list = document.getElementById("users");
        while (user_list.firstChild) {
            user_list.removeChild(user_list.firstChild);
        }
        remaining_users.forEach(user => createUserNameInList(user.user_name));
    }
});

// user lobby functions
// ________________________________________________________________________________________________
function load() {
    // try to get the game code from url to see if the player wants to create or join a room
    if (game_code) {
        // user clicked on join room and passed therfore a game code
        socket.emit("join game lobby", game_code, user_name);
        
        // write game code to span
        const game_code_span = document.getElementById("game-code");
        const code = document.createTextNode(game_code);
        game_code_span.appendChild(code);
    } else {
        // user clicked on create room = no game code exists
        createUserNameInList(user_name);
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

// server communication in game
// __________________________________________________________________________________________________________

socket.on("game start", startGame);

// in game functions
// __________________________________________________________________________________________________________

function startGame() {
    document.body.innerHTML = "";
    makeCreatePhraseScreen();
}

function makeCreatePhraseScreen() {
    console.log("input phrase");
}

function makeDrawScreen() {
    console.log("draw screen")
}

function makeDescribeScreen() {
    console.log("describe screen");
}
