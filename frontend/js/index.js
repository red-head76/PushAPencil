window.addEventListener("load", load);

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
    const game_code_input = document.getElementById("game-code-input");
    const game_code = game_code_input.value;
    
    // get the username and clear the inut field
    const name_input = document.getElementById("name-input");
    const user_name = name_input.value;
    
    // user name validation
    if ((user_name.length < 3 || user_name.lengt > 25) & game_code.length !== 6) {
 
        // make name input red, if it is not already red
        if (!document.getElementById("invalid-name-input")) {
            name_input.classList.add("is-invalid");
            
            const invalid_name_text = document.createTextNode("3-25 characters");
            const label = document.createElement("label");
            label.className = "form-label text-danger";
            label.id = "invalid-name-input";
            label.appendChild(invalid_name_text);
            
            const name_input_box = document.getElementById("name-input-box");
            name_input_box.appendChild(label);
        }
        
        // make game code input red, if it isnt
        if (!document.getElementById("invalid-game-code-input")) {
            game_code_input.classList.add("is-invalid");
            
            const invalid_name_text = document.createTextNode("invalid game code");
            const label = document.createElement("label");
            label.className = "form-label text-danger";
            label.id = "invalid-game-code-input";
            label.appendChild(invalid_name_text);
            
            const game_code_input_box = document.getElementById("game-code-input-box");
            game_code_input_box.appendChild(label);
        }           
    } else if (game_code.length !== 6) {
        
        console.log(document.getElementById("invalid-name-input"));
        // make name input normal if it is red and has a valid entry
        if (document.getElementById("invalid-name-input")) {
            const name_input_box = document.getElementById("name-input-box");
            const invalid_name = document.getElementById("invalid-name-input");
            name_input_box.removeChild(invalid_name);
            name_input.classList.remove("is-invalid");
        }
        
        // make came code input red
        if (!document.getElementById("invalid-game-code-input")) {
            game_code_input.classList.add("is-invalid");
            
            const invalid_name_text = document.createTextNode("invalid game code");
            const label = document.createElement("label");
            label.className = "form-label text-danger";
            label.id = "invalid-game-code-input";
            label.appendChild(invalid_name_text);
            
            const game_code_input_box = document.getElementById("game-code-input-box");
            game_code_input_box.appendChild(label);
        }
    } else if (user_name.length < 3 || user_name.lengt > 25) {
        
        // make game code input normal if it is red and has valid entry
        if (document.getElementById("invalid-game-code-input")) {
            const game_code_input_box = document.getElementById("game-code-input-box");
            const invalid_game_code = document.getElementById("invalid-game-code-input");
            game_code_input_box.removeChild(invalid_game_code);
            game_code_input.classList.remove("is-invalid");
        }
        
        // make name input red, if it is not already red
        if (!document.getElementById("invalid-name-input")) {
            name_input.classList.add("is-invalid");
            
            const invalid_name_text = document.createTextNode("3-25 characters");
            const label = document.createElement("label");
            label.className = "form-label text-danger";
            label.id = "invalid-name-input";
            label.appendChild(invalid_name_text);
            
            const name_input_box = document.getElementById("name-input-box");
            name_input_box.appendChild(label);
        }
    } else {
        window.location.href = this.href + "?user-name=" + user_name + "&game-code=" + game_code;
    }
}


function load () {
    const url = new URL(window.location.href);
    const user_name = url.searchParams.get("user-name");
    const game_code = url.searchParams.get("game-code");
    
    if (game_code) {
        const name_input = document.getElementById("name-input");
        const game_code_input = document.getElementById("game-code-input");
        
        name_input.value = user_name;
        game_code_input.value = game_code;
        
        // make came code input red
        if (!document.getElementById("invalid-game-code-input")) {
            game_code_input.classList.add("is-invalid");
            
            const invalid_name_text = document.createTextNode("this room does not exist");
            const label = document.createElement("label");
            label.className = "form-label text-danger";
            label.id = "invalid-game-code-input";
            label.appendChild(invalid_name_text);
            
            const game_code_input_box = document.getElementById("game-code-input-box");
            game_code_input_box.appendChild(label);
        }        
    }
}
