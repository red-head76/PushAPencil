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
const show_results_div = document.getElementById("show-results-div");
const divNames = ["game-lobby-div", "draw-div", "starting-phrase-div", "describe-div", "show-results-div"];

// to handle disconnects different if the game has game has started
var is_waiting = false;
var game_state = "lobby";  // one of lobby, start, draw, describe
const tasks = [];

var game_state = "draw";

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

    // TODO load screens for different game states, but persistend socket.id required
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
    } else if (game_state === "show results") {
        makeResultsScreen();
    } else if (game_state === "draw") {
        makeDrawScreen("Ein Luis")
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
    // TODO require min user number
    game_state = "start";
    makeCreatePhraseScreen();
});

socket.on("next task", function(type, task) {
    if (type === "describe") {
        if (is_waiting) {
                makeDrawScreen(task);
                is_waiting = false;
        } else {
            next_task = { type, task };
            tasks.push(next_task);
        }        
    } else {
        if (is_waiting) {
                makeDescribeScreen(task);
                is_waiting = false;
        } else {
            next_task = { type, task };
            tasks.push(next_task);
        }
    }
});

// in game functions
// __________________________________________________________________________________________________________

const start_btn = document.getElementById("start-btn");
start_btn.addEventListener("click", startGame);

const continue_btn = document.getElementById("continue-btn");
continue_btn.addEventListener("click", continueWithDrawing);

const submit_drawing_btn = document.getElementById("submit");
submit_drawing_btn.addEventListener("click", continueWithDescribing);

const submit_describtion_btn = document.getElementById("submit-describtion-btn");
submit_describtion_btn.addEventListener("click", continueWithDrawing);

function startGame() {
    socket.emit("game start", game_code);
    makeCreatePhraseScreen();
    game_state = "start";
}

function continueWithDrawing() {
    
    var phrase;
    
    if (game_state === "start") {
        phrase = document.getElementById("starting-phrase-input").value;
    } else {
        phrase = document.getElementById("describtion-input").value;
        document.getElementById("describtion-input").value = "";
        const image_to_describe_div = document.getElementById("image-to-describe");
        image_to_describe_div.innerHTML = "";
    }

    socket.emit("push task", "describe", phrase, game_code);

    // TODO counter for game length and Game end
    if (tasks.length > 0) {
        makeDrawScreen(tasks.pop().task);
        game_state = "draw";
    } else {
        is_waiting = true;
        game_state = "draw";
        makeWaitScreen();
    }
}

function continueWithDescribing() {

    const to_draw = document.getElementById("to-draw");
    to_draw.innerHTML = "";

    const drawing = canvas.toDataURL();
    socket.emit("push task", "draw", drawing, game_code);

    if (tasks.length > 0) {
        makeDescribeScreen(tasks.pop().task);
        game_state = "describe";
    } else {
        is_waiting = true;
        game_state = "describe";
        makeWaitScreen();
    }
}

// Help function for all other make...Screen functions
function makeScreen(calledDiv) {
    // set all divs to none
    for (var divNumber = 0; divNumber < divNames.length; divNumber++) {
        document.getElementById(divNames[divNumber]).style.display = "none";
    }
    // except the called one
    if (calledDiv) {
        document.getElementById(calledDiv).style.display = "";
    }
}

function makeGameLobbyScreen () {
    makeScreen("game-lobby-div");
}

function makeCreatePhraseScreen() {
    makeScreen("starting-phrase-div");
}

function makeDrawScreen(phrase) {
    makeScreen("draw-div");

    const to_draw = document.getElementById("to-draw");
    const text_node = document.createTextNode(phrase);
    to_draw.appendChild(text_node);

    initDrawingTool();
}

function makeDescribeScreen(drawing) {
    makeScreen("describe-div");

    const picture = document.createElement("img");
    picture.src = drawing;
    picture.style.width = "50%";
    const image_to_describe_div = document.getElementById("image-to-describe");
    image_to_describe_div.appendChild(picture);
}

function makeWaitScreen() {
    makeScreen(false);
}

function makeResultsScreen() {
    makeScreen("show-results-div");
}


// draw to canvas functions
// ______________________________________________________________________________________________________

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var canvas_background = document.getElementById("myBackgroundCanvas");
var ctx_background = canvas_background.getContext("2d");

// last known position
var pos = { x: 0, y: 0 };
var rect = canvas.getBoundingClientRect();
var offset_x;
var offset_y;

var mode = "pencil"; // pencil, fill
var background_color = "#ffffff"; // White
var last_color = "#000000";     // Black

window.addEventListener("resize", resize);
canvas.addEventListener("mousemove", drawLine);
canvas.addEventListener("mousedown", beginLine);
canvas.addEventListener("mouseup", endLine);

function clearAll() {
    small_pencil.style.fill = "white";
    medium_pencil.style.fill = "gray";
    big_pencil.style.fill = "white";
    
    ctx.lineWidth = "5";
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";
    
    mode = "pencil"; // pencil, fill
    background_color = "#ffffff";
    last_color = "black";
    
    pencil.style.fill = "gray";
    rubber.style.fill = "white";
    background.style.fill = "white";
    fill.style.fill = "white";
    
    ctx_background.fillStyle = "white";
    ctx_background.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    show_color.style.fill = "black";
}

// resize canvas
function resize() {
    canvas.width = window.innerWidth * 0.6;
    canvas.height = window.innerHeight;
    canvas_background.width = window.innerWidth * 0.6;
    canvas_background.height = window.innerHeight
}

function initDrawingTool() {
    canvas.width = window.innerWidth * 0.6;
    canvas.height = window.innerHeight;
    
    canvas_background.width = window.innerWidth * 0.6;
    canvas_background.height = window.innerHeight;
    ctx_background.fillStyle = "white";
    ctx_background.fillRect(0, 0, canvas.width, canvas.height);
    
    medium_pencil.style.fill = "gray";
    ctx.lineWidth = "5";
    ctx.strokeStyle = "black";
    ctx.lineCap = "round";
    rect = canvas.getBoundingClientRect();
    offset_x = rect.left;
    offset_y = rect.top;

    pencil.style.fill = "gray";
    rubber.style.fill = "white";
    background.style.fill = "white";
    fill.style.fill = "white";
    
    small_pencil.style.fill = "white";
    medium_pencil.style.fill = "gray";
    big_pencil.style.fill = "white";

    show_color.style.fill = "black";
}


function fillBackground(color) {
    background_color = color;
    ctx_background.fillStyle = color;
    ctx_background.fillRect(0, 0, canvas_background.width, canvas_background.height);
}

// new position from mouse event
function beginLine(e) {
    if (e.button == 1 || mode == "fill") {
        if (mode == "rubber") {
            ctx
        } else {
            bucketTool(e);
        }
    } else if (mode == "pencil" || mode == "rubber") {
            pos.x = getX(e);
            pos.y = getY(e);

            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
    }
}

function drawLine(e) {
    if (mode == "pencil" || mode == "rubber") {
        if (e.buttons !== 1) return;

        pos.x = getX(e);
        pos.y = getY(e);

        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.moveTo(pos.x, pos.y);
    }
}

function endLine(e) {
    if (mode == "pencil" || mode == "rubber") {
        if (e.button !== 1) {
            pos.x = getX(e);
            pos.y = getY(e);

            ctx.lineTo(pos.x, pos.y);
            ctx.stroke(); // Draw it
        }
    }
}

function tweezerTool(e) {
    const colorLayer = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const startColor = getPixelColor(colorLayer, getX(e), getY(e));
    console.log("R:", startColor[0]);
    console.log("G:", startColor[1]);
    console.log("B:", startColor[2]);
    console.log("Alpha:", startColor[3]);
    console.log(Math.min.apply(Math, startColor))
}


// bucket tool (fill tool) from
// http://www.williammalone.com/articles/html5-canvas-javascript-paint-bucket-tool/
function bucketTool(e) {
    var colorLayer = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const startX = getX(e);
    const startY = getY(e);
    var pixelStack = [[startX, startY]];
    const StartColor = getPixelColor(colorLayer, startX, startY);
    const FillColor = HEXtoRGBA(ctx.strokeStyle);
    var newPos, x, y, reachLeft, reachRight;

    if (!equals(StartColor, FillColor)) {
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

var color_palette = document.getElementById("color_palette");
var colors = color_palette.getElementsByTagName("path");
var colors_array = Array.prototype.slice.call(colors);
var show_color = document.getElementById("show-current-color");

colors_array.forEach(function(color, index) {
    color.addEventListener("click", function() {
        if (color.id !== "show-current-color") {
            if (mode == "pencil" || mode == "fill") {
                ctx.strokeStyle = color.style.fill;
                last_color = ctx.strokeStyle;
                show_color.style.fill = color.style.fill;
            } else if (mode == "background") {
                //ctx.strokeStyle = color.style.fill;
                fillBackground(color.style.fill);
                //ctx.strokeStyle = last_color;
            }
        }
    });
});

var rubber = document.getElementById("rubber");
rubber.addEventListener("click", function(event) {
    last_color = ctx.strokeStyle;
    ctx.strokeStyle = background_color;
    mode = "rubber";
    pencil.style.fill = "white";
    rubber.style.fill = "gray";
    background.style.fill = "white";
    fill.style.fill = "white";
});

var pencil = document.getElementById("pencil");
pencil.addEventListener("click", function(event) {
    ctx.strokeStyle = last_color;
    mode = "pencil";
    pencil.style.fill = "gray";
    rubber.style.fill = "white";
    background.style.fill = "white";
    fill.style.fill = "white";
});

var fill = document.getElementById("fill");
fill.addEventListener("click", function(event) {
    ctx.strokeStyle = last_color;
    mode = "fill"
    pencil.style.fill = "white";
    rubber.style.fill = "white";
    background.style.fill = "white";
    fill.style.fill = "gray";
});

var background = document.getElementById("background-btn");
background.addEventListener("click", function(event) {
    mode = "background";
    pencil.style.fill = "white";
    rubber.style.fill = "white";
    background.style.fill = "gray";
    fill.style.fill = "white";
});

var clear = document.getElementById("clear");
clear.addEventListener("click", function(event) {
        clearAll()
});

var small_pencil = document.getElementById("small-pencil");
var medium_pencil = document.getElementById("medium-pencil");
var big_pencil = document.getElementById("big-pencil");

small_pencil.addEventListener("click", function(event) {
    ctx.lineWidth = "1";
    small_pencil.style.fill = "gray";
    medium_pencil.style.fill = "white";
    big_pencil.style.fill = "white";
});

medium_pencil.addEventListener("click", function(event) {
    ctx.lineWidth = "5";
    small_pencil.style.fill = "white";
    medium_pencil.style.fill = "gray";
    big_pencil.style.fill = "white";
});

big_pencil.addEventListener("click", function(event) {
    ctx.lineWidth = "20";
    small_pencil.style.fill = "white";
    medium_pencil.style.fill = "white";
    big_pencil.style.fill = "gray";
});

// _____________________________________________________________________________
// Helper functions

// Array comparison
const equals = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// get position with canvas offset
function getX(e) { return (e.clientX - Math.floor(offset_x)); }
function getY(e) { return (e.clientY - Math.floor(offset_y)); }


// converting x, y coordinates into 1d position
function getPixelPos(x, y) {
    return ((y * canvas.width + x) * 4);
}

// Return color (RGBA) at pixel position
function getPixelColor(colorLayer, x, y) {
    const pixelPos = getPixelPos(x, y);
    const color = [colorLayer.data[pixelPos], colorLayer.data[pixelPos+1],
                   colorLayer.data[pixelPos+2], colorLayer.data[pixelPos+3]];
    if (equals(color, [0, 0, 0, 0])) {
        return [255, 255, 255, 255];
    } else {
        return color;
    }
}

// checks if the color at x, y matches the desired color
function checkColorMatch(colorLayer, x, y, matchColor) {
    pixelColor = getPixelColor(colorLayer, x, y);
    return equals(pixelColor, matchColor);
    // return (colorLayer.data[pixelPos] == matchColor[0] &&
    //         colorLayer.data[pixelPos + 1]== matchColor[1] &&
    //         colorLayer.data[pixelPos + 2] == matchColor[2]);
}

// transforms hex color (string) into RGBA (list) values
function HEXtoRGBA(hex) {
    hex = hex.replace(/#/g, "");
    if (hex.length === 3) {
        hex = hex.split("").map(function (hex) {
            return hex + hex;
        }).join("");
    }
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})[\da-z]{0,0}$/i.exec(hex);
    if (result) {
        const red = parseInt(result[1], 16);
        const green = parseInt(result[2], 16);
        const blue = parseInt(result[3], 16);

        return [red, green, blue, 255]; // just return full alpha (255) everywhere
    } else {
        return null;
    }
}

// changes the value (color) in a colorLayer to a desired color
function colorPixel(colorLayer, x, y, newColor) {
    pixelPos = getPixelPos(x, y);
    colorLayer.data[pixelPos] = newColor[0];
    colorLayer.data[pixelPos+1] = newColor[1];
    colorLayer.data[pixelPos+2] = newColor[2];
    colorLayer.data[pixelPos+3] = 255;
}
