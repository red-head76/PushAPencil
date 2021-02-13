window.addEventListener("load", load);

function load() {
    var url = new URL(window.location.href);
    var game_code = url.searchParams.get("game-code");
    var user_name = url.searchParams.get("user-name");
    
    var game_code_span = document.getElementById("game-code");
    var user = document.createTextNode(game_code);
    game_code_span.appendChild(user);
    
    createUserNameInList(user_name);
}

function createUserNameInList(user_name) {
    var user_list = document.getElementById("users");
    var new_user = document.createTextNode(user_name);
    var new_user_entry = document.createElement("li");
    
    new_user_entry.className = "list-group-item";
    new_user_entry.appendChild(new_user);
    user_list.appendChild(new_user_entry);
}
    
