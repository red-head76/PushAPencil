const socket = io();

const create_game_button = document.getElementById('create-btn');
create_game_button.addEventListener('click', createGame);

function createGame(event) {
    event.preventDefault();
    
    var name_input = document.getElementById('name-input');
    var user_name = name_input.value;
    name_input.value = '';
    
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
        game_id = newGameId();
        window.location.href = this.href + "?game-code=" + game_id + "&user-name=" + user_name;
        var game_code = document.getElementById("game-code");
        socket.emit("new game lobby", user_name, newGameId());
    }
}

function newGameId() {
   var result = '';
   var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
    
