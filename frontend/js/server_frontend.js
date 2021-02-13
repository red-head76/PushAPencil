const socket = io();

socket.on('user join', function (msg) {
    console.log('user joined from server');
});

const create_game_button = document.getElementById('create-btn');
create_game_button.addEventListener('click', createGame);

function createGame(event) {
    event.preventDefault();
    
    var name_input = document.getElementById('name-input');
    var user_name = name_input.value;
    name_input.value = '';
    
    // user name validation
    if (user_name.length < 3 || user_name.lengt > 25) {
        name_input.classList.add('is-invalid');
        
        var invalid_name_text = document.createTextNode("3-25 characters");
        var label = document.createElement('label');
        label.className = "form-label text-danger";
        label.appendChild(invalid_name_text);
        
        var name_input_box = document.getElementById('name-input-box');
        name_input_box.appendChild(label);
    }
    
    console.log(user_name.length);
}
    
