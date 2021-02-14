const socket = io()

const create_game_button = document.getElementById("create-btn");
create_game_button.addEventListener("click", createGame);

const join_game_btn = document.getElementById("join-btn");
join_game_btn.addEventListener("click", joinGame);

function createGame(event) {
    // prevents realoading the side
    event.preventDefault();
    
    // get the username and clear the inut field
    var name_input = document.getElementById("name-input");
    var user_name = name_input.value;
    
    // user name validation
    if (user_name.length < 3 || user_name.lengt > 25) {
        if (!document.getElementById("invalid-name-input")) {
            name_input.classList.add("is-invalid");
            
            var invalid_name_text = document.createTextNode("3-25 characters");
            var label = document.createElement("label");
            label.className = "form-label text-danger";
            label.id = "invalid-name-input";
            label.appendChild(invalid_name_text);
            
            var name_input_box = document.getElementById("name-input-box");
            name_input_box.appendChild(label);
        }
    } else {
        // if the username is valid open the lobby and send a message to the server
        window.location.href = this.href + "?user-name=" + user_name;
    }
}

function joinGame(event) {
    // prevents realoading the side
    event.preventDefault();
    
    // get the game code and clear the inut field
    var game_code_input = document.getElementById("game-code-input");
    var game_code = game_code_input.value;
    
    // TODO: game code validation on server side
    
    // get the username and clear the inut field
    var name_input = document.getElementById("name-input");
    var user_name = name_input.value;
    
    // user name validation
    if (user_name.length < 3 || user_name.lengt > 25) {
        if (game_code.length == 6) {
            const game_code_input_box = document.getElementById("game-code-input-box");
            const invalid_game_code = document.getElementById("invalid-game-code-input");
            game_code_input_box.removeChild(invalid_game_code);
            game_code_input.classList.remove("is-invalid");
        }        
        if (!document.getElementById("invalid-name-input")) {
            name_input.classList.add("is-invalid");
            
            var invalid_name_text = document.createTextNode("3-25 characters");
            var label = document.createElement("label");
            label.className = "form-label text-danger";
            label.id = "invalid-name-input";
            label.appendChild(invalid_name_text);
            
            var name_input_box = document.getElementById("name-input-box");
            name_input_box.appendChild(label);
        }
    } else if (game_code.length !== 6) {
        if (document.getElementById("invalid-name-input")) {
            const name_input_box = document.getElementById("name-input-box");
            const invalid_name = document.getElementById("invalid-name-input");
            name_input_box.removeChild(invalid_name);
            name_input.classList.remove("is-invalid");
        }
        if (!document.getElementById("invalid-game-code-input")) {
            game_code_input.classList.add("is-invalid");
            
            var invalid_name_text = document.createTextNode("invalid game code");
            var label = document.createElement("label");
            label.className = "form-label text-danger";
            label.id = "invalid-game-code-input";
            label.appendChild(invalid_name_text);
            
            var game_code_input_box = document.getElementById("game-code-input-box");
            game_code_input_box.appendChild(label);
        }        
    } else {
        window.location.href = this.href + "?user-name=" + user_name + "&game-code=" + game_code;
    }
}





