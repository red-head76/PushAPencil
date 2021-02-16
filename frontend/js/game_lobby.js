const socket = io();

window.addEventListener("load", load);

const url = new URL(window.location.href);
const user_name = url.searchParams.get("user-name");
var game_code = url.searchParams.get("game-code");

// divs to switch between for differen game states
const game_lobby_div = document.getElementById("game-lobby-div");        
const draw_div = document.getElementById("draw-div");
const starting_phrase_div = document.getElementById("starting-phrase-div");
const describe_div = document.getElementById("describe-div");
        
// to handle disconnects different if the game has game has started
var is_waiting = false;
var game_state = "lobby";  // one of lobby, start, draw, describe
const tasks = [];

// server communication in user lobby
// _______________________________________________________________________________________________
socket.on("new game lobby", function(new_game_code) {
    // gets a new game code from the server and prints it to screen
    const game_code_span = document.getElementById("game-code");
    const code = document.createTextNode(new_game_code);
    game_code_span.appendChild(code);
    game_code = new_game_code;
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
    if (game_state === "lobby") {
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
    
    if (game_state === "lobby") {
        
        makeGameLobbyScreen ()
        
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

socket.on("game start", function() {
    game_state = "start";
    makeCreatePhraseScreen();
});

socket.on("starting phrase", function(starting_phrase) {
    console.log("starting phrase resived");
    if (is_waiting) {
            makeDrawScreen();
            // TODO draw right starting phrase
            is_waiting = false;
    } else {
        task = "draw";
        next_task = { task, starting_phrase };
        tasks.push(next_task);
    }
});

// in game functions
// __________________________________________________________________________________________________________

const start_btn = document.getElementById("start-btn");
start_btn.addEventListener("click", startGame);

const continue_btn = document.getElementById("continue-btn");
continue_btn.addEventListener("click", startWithDrawing);

const submit_drawing_btn = document.getElementById("submit");
submit_drawing_btn.addEventListener("click", continueWithDescribing);

const submit_describtion_btn = document.getElementById("submit-describtion-btn");
submit_describtion_btn.addEventListener("click", continueWithDrawing);

function startGame() {
    socket.emit("game start", game_code);
    makeCreatePhraseScreen();
}

function startWithDrawing() {
    
    const starting_phrase = document.getElementById("starting-phrase-input").value;
    socket.emit("starting phrase", starting_phrase, game_code);
    
    console.log(tasks);
    
    if (tasks.length > 0) {
        makeDrawScreen();
        // TODO delete task and print it
        const phrase = tasks.pop().starting_phrase
        game_state = "draw";
    } else {
        is_waiting = true;
        game_state = "draw";
        makeWaitScreen();
    }
}

function continueWithDrawing() {
    
    if (game_state === "lobby") {
        const starting_phrase = document.getElementById("starting-phrase-input").value;
        // TODO input validation 5 < length < 50???, only a-z, 1-9, and ' ', (&/()[]) ???
        socket.emit("starting phrase", starting_phrase);
    }
    
    // TODO counter for game length and Game end
    if (tasks.length > 0) {
        makeDrawScreen();
        game_state = "draw";
    } else {
        is_waiting = true;
        game_state = 'draw';
        makeWaitScreen();
    }
}

function continueWithDescribing() {
    if (tasks.length > 0) {
        makeDescribeScreen();
        game_state = "describe";
    } else {
        is_waiting = true;
        game_state = "describe";
        makeWaitScreen();
    }
}

function makeGameLobbyScreen () {
    starting_phrase_div.style.display = "none";
    describe_div.style.display = "none";
    draw_div.style.display = "none";
    game_lobby_div.style.display = "";
}

function makeCreatePhraseScreen() {
    describe_div.style.display = "none";
    game_lobby_div.style.display = "none";
    draw_div.style.display = "none";
    starting_phrase_div.style.display = "";
}

function makeDrawScreen() {
    describe_div.style.display = "none";
    starting_phrase_div.style.display = "none";
    draw_div.style.display = "";
    game_lobby_div.style.display = "none";
    initDrawingTool();
}

function makeDescribeScreen() {
    describe_div.style.display = "";
    game_lobby_div.style.display = "none";
    draw_div.style.display = "none";
    starting_phrase_div.style.display = "none";
}

function makeWaitScreen() {
    describe_div.style.display = "none";
    game_lobby_div.style.display = "none";
    draw_div.style.display = "none";
    starting_phrase_div.style.display = "none";
}

// draw to canvas funcitons
// ______________________________________________________________________________________________________

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext('2d');

// last known position
var pos = { x: 0, y: 0 };
var rect;
var offset_x;
var offset_y;

var mode = 'pencil'; // pencil, fill
var background_color = '#000000'; // Black, not really true, but background filling tool works then
var last_color = '#000000';     // Black

// window.addEventListener('load', load);
window.addEventListener('resize', resize);
canvas.addEventListener('mousemove', drawLine);
canvas.addEventListener('mousedown', beginLine);
canvas.addEventListener('mouseup', endLine);

function clearAll() {
    small_pencil.style.fill = 'white';
    medium_pencil.style.fill = 'gray';
    big_pencil.style.fill = 'white';
    ctx.lineWidth = "5";
    ctx.lineCap = "round";
    mode = 'pencil'; // pencil, fill
  
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    background_color = "white";
    
    ctx.strokeStyle = "black";
    last_color = 'black';

    pencil.style.fill = 'gray';
    rubber.style.fill = 'white';
    background.style.fill = 'white';
    fill.style.fill = 'white';

    show_color.style.fill = 'black';
}

// resize canvas
function resize() {
    canvas.width = window.innerWidth * 0.6;
    canvas.height = window.innerHeight;
}

function initDrawingTool() {
    canvas.width = window.innerWidth * 0.6;
    canvas.height = window.innerHeight;
    medium_pencil.style.fill = 'gray';
    ctx.lineWidth = "5";
    ctx.strokeStyle = "black";
    ctx.lineCap = "round";
    
    rect = canvas.getBoundingClientRect();
    offset_x = rect.left;
    offset_y = rect.top;

    pencil.style.fill = 'gray';
    rubber.style.fill = 'white';
    background.style.fill = 'white';
    fill.style.fill = 'white';

    show_color.style.fill = 'black';
}

function getX(e) { return (e.clientX - Math.floor(offset_x)); }
function getY(e) { return (e.clientY - Math.floor(offset_y)); }

function fillBackground() {
    // Fills the canvas at every pixel that matches the old background color
    colorLayer = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var old_Bkg_Color_RGB = HEXtoRGB(background_color);
    background_color = ctx.strokeStyle;
    var new_Bkg_Color_RGB = HEXtoRGB(background_color);

    for (var x = 0; x < canvas.width; x++) {
        for (var y = 0; y < canvas.height; y++) {
            if (checkColorMatch(colorLayer, x, y, old_Bkg_Color_RGB)) {
                colorPixel(colorLayer, x, y, new_Bkg_Color_RGB);
            }
        }
    }
    ctx.putImageData(colorLayer, 0, 0);
}

// new position from mouse event
function beginLine(e) {
    if (mode === 'pencil' || mode === 'rubber') {
        if (e.button == 1) {
            fillBackground()
        } else {
            pos.x = getX(e);
            pos.y = getY(e);

            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        }
    } else if (mode === 'fill') {
        bucketTool(e);
    }
}

function drawLine(e) {
    console.log(mode);
    if (mode === 'pencil' || mode === 'rubber') {
        if (e.buttons !== 1) return;

        pos.x = getX(e);
        pos.y = getY(e);

        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.moveTo(pos.x, pos.y);
    }
}

function endLine(e) {
    if (mode === 'pencil' || mode === 'rubber') {
        if (e.button !== 1) {
            pos.x = getX(e);
            pos.y = getY(e);

            ctx.lineTo(pos.x, pos.y);
            ctx.stroke(); // Draw it
        }
    }
}

// bucket tool (fill tool) from
// http://www.williammalone.com/articles/html5-canvas-javascript-paint-bucket-tool/
function bucketTool(e) {
    var colorLayer = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var startX = getX(e);
    var startY = getY(e);
    var pixelStack = [[startX, startY]];
    var startPixelPos = calcPixelPos(startX, startY)
    var StartColor = [colorLayer.data[startPixelPos], colorLayer.data[startPixelPos+1],
                  colorLayer.data[startPixelPos+2], colorLayer.data[startPixelPos+3]];
    var FillColor = HEXtoRGB(ctx.strokeStyle);
    var newPos, x, y, reachLeft, reachRight;

    if (StartColor[0] !== FillColor[0] || StartColor[1] !== FillColor[1] ||
        StartColor[2] !== FillColor[2]) {
        while (pixelStack.length) {
            newPos = pixelStack.pop();
            x = newPos[0];
            y = newPos[1];
            while (y >= 0 && checkColorMatch(colorLayer, x, y, StartColor)) {
                y--;
            }
            y++;
            reachLeft = false;
            reachRight = false;

            while (y < canvas.height-1 && checkColorMatch(colorLayer, x, y, StartColor)) {
                colorPixel(colorLayer, x, y, FillColor);

                // Look to the left if there is still a pixel to be colored and at it
                // to the stack in that case
                if (x > 0) {
                    if(checkColorMatch(colorLayer, x - 1, y, StartColor)) {
                        if(!reachLeft) {
                            pixelStack.push([x - 1, y]);
                            reachLeft = true;
                        }
                    } else if (reachLeft) {
                        reachLeft = false;
                    }
                }
                // Look to the right
                if (x < canvas.width - 1) {
                    if (checkColorMatch(colorLayer, x + 1, y, StartColor)) {
                        if(!reachRight) {
                            pixelStack.push([x + 1, y]);
                            reachRight = true;
                        }
                    } else if (reachRight) {
                        reachRight = false;
                    }
                }
                y++;
            }
            ctx.putImageData(colorLayer, 0, 0);
        }
    }
}

var color_palette = document.getElementById('color_palette');
var colors = color_palette.getElementsByTagName('path');
var colors_array = Array.prototype.slice.call(colors);
var show_color = document.getElementById('show-current-color');

colors_array.forEach(function(color, index) {
    color.addEventListener('click', function() {
        if (color.id !== 'show-current-color') {
            if (mode == 'pencil' || mode == 'fill') {
                ctx.strokeStyle = color.style.fill;
                last_color = ctx.strokeStyle;
                show_color.style.fill = color.style.fill;
            } else if (mode == 'background') {
                ctx.strokeStyle = color.style.fill;
                fillBackground();
                ctx.strokeStyle = last_color;
            }
        }
    });
});

var rubber = document.getElementById('rubber');
rubber.addEventListener('click', function(event) {
    last_color = ctx.strokeStyle;
    ctx.strokeStyle = background_color;
    mode = 'rubber';
    pencil.style.fill = 'white';
    rubber.style.fill = 'gray';
    background.style.fill = 'white';
    fill.style.fill = 'white';
});

var pencil = document.getElementById('pencil');
pencil.addEventListener('click', function(event) {
    ctx.strokeStyle = last_color;
    mode = 'pencil';
    pencil.style.fill = 'gray';
    rubber.style.fill = 'white';
    background.style.fill = 'white';
    fill.style.fill = 'white';
});

var fill = document.getElementById('fill');
fill.addEventListener('click', function(event) {
    ctx.strokeStyle = last_color;
    mode = 'fill'
    pencil.style.fill = 'white';
    rubber.style.fill = 'white';
    background.style.fill = 'white';
    fill.style.fill = 'gray';
});

var background = document.getElementById('background-btn');
background.addEventListener('click', function(event) {
    mode = 'background';
    pencil.style.fill = 'white';
    rubber.style.fill = 'white';
    background.style.fill = 'gray';
    fill.style.fill = 'white';
});

var clear = document.getElementById('clear');
clear.addEventListener('click', function(event) {
        clearAll()
});

var small_pencil = document.getElementById('small-pencil');
var medium_pencil = document.getElementById('medium-pencil');
var big_pencil = document.getElementById('big-pencil');

small_pencil.addEventListener('click', function(event) {
    ctx.lineWidth = "1";
    small_pencil.style.fill = 'gray';
    medium_pencil.style.fill = 'white';
    big_pencil.style.fill = 'white';
});

medium_pencil.addEventListener('click', function(event) {
    ctx.lineWidth = "5";
    small_pencil.style.fill = 'white';
    medium_pencil.style.fill = 'gray';
    big_pencil.style.fill = 'white';
});

big_pencil.addEventListener('click', function(event) {
    ctx.lineWidth = "20";
    small_pencil.style.fill = 'white';
    medium_pencil.style.fill = 'white';
    big_pencil.style.fill = 'gray';
});

// _____________________________________________________________________________
// Helper functions
// converting x, y coordinates into 1d position
function calcPixelPos(x, y) {
    return ((y * canvas.width + x) * 4);
}

// checks if the color at x, y matches the desired color
function checkColorMatch(colorLayer, x, y, matchColor) {
    pixelPos = calcPixelPos(x, y);
    return (colorLayer.data[pixelPos] == matchColor[0] &&
            colorLayer.data[pixelPos + 1]== matchColor[1] &&
            colorLayer.data[pixelPos + 2] == matchColor[2]);
}

// transforms hex color (string) into RGB (list) values
function HEXtoRGB(hex) {
    hex = hex.replace(/#/g, '');
    if (hex.length === 3) {
        hex = hex.split('').map(function (hex) {
            return hex + hex;
        }).join('');
    }
    var result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})[\da-z]{0,0}$/i.exec(hex);
    if (result) {
        var red = parseInt(result[1], 16);
        var green = parseInt(result[2], 16);
        var blue = parseInt(result[3], 16);

        return [red, green, blue];
    } else {
        return null;
    }
}

// changes the value (color) in a colorLayer to a desired color
function colorPixel(colorLayer, x, y, newColor) {
    pixelPos = calcPixelPos(x, y);
    colorLayer.data[pixelPos] = newColor[0];
    colorLayer.data[pixelPos+1] = newColor[1];
    colorLayer.data[pixelPos+2] = newColor[2];
    colorLayer.data[pixelPos+3] = 255;
}


// _____________________________________________________________________________
// Alternative bucket tool function
function bucketTool2(e) {
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;
    colorLayer = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    startX = getX(e);
    startY = getY(e);
    pixelStack = [[startX, startY]];

    function pixelPos(x, y) {   // converting x, y coordinates into 1d position
        return ((y * canvasWidth + x) * 4);
    }

    var StartR = colorLayer.data[pixelPos(startX, startY)];
    var StartG = colorLayer.data[pixelPos(startX, startY) + 1];
    var StartB = colorLayer.data[pixelPos(startX, startY) + 2];
    var StartA = colorLayer.data[pixelPos(startX, startY) + 3];
    var FillColorRGB = HEXtoRGB(ctx.strokeStyle);
    var newPos, x, y;

    while (pixelStack.length) {
        newPos = pixelStack.pop();
        x = newPos[0];
        y = newPos[1];

        if (matchStartColor(pixelPos(x, y)) && (StartR !== FillColorRGB[0] ||
            StartG !== FillColorRGB[1] || StartB !== FillColorRGB[2])) {
            colorPixel(pixelPos(x, y));

            pixelStack.push([x, y + 1]); // below
            pixelStack.push([x, y - 1]); // above
            pixelStack.push([x + 1, y]); // right
            pixelStack.push([x - 1, y]); // left
        }
    }
    ctx.putImageData(colorLayer, 0, 0);

    function matchStartColor(pixelPos) {
        var r = colorLayer.data[pixelPos];
        var g = colorLayer.data[pixelPos + 1];
        var b = colorLayer.data[pixelPos + 2];
        var a = colorLayer.data[pixelPos + 3];

        return (r == StartR && g == StartG && b == StartB && a==StartA);
    }

    function HEXtoRGB(hex) {
        hex = hex.replace(/#/g, '');
        if (hex.length === 3) {
            hex = hex.split('').map(function (hex) {
                return hex + hex;
            }).join('');
        }
        var result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})[\da-z]{0,0}$/i.exec(hex);
        if (result) {
            var red = parseInt(result[1], 16);
            var green = parseInt(result[2], 16);
            var blue = parseInt(result[3], 16);

            return [red, green, blue];
        } else {
            return null;
        }
    }

    function colorPixel(pixelPos) {
        var FillColorRGB = HEXtoRGB(ctx.strokeStyle);
        colorLayer.data[pixelPos] = FillColorRGB[0];
        colorLayer.data[pixelPos+1] = FillColorRGB[1];
        colorLayer.data[pixelPos+2] = FillColorRGB[2];
        colorLayer.data[pixelPos+3] = 255;
    }
}
