var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext('2d');

// last known position
var pos = { x: 0, y: 0 };
var rect = canvas.getBoundingClientRect();
var offset_x;
var offset_y;

var mode = 'pencil'; // pencil, fill
var background_color = '#ffffff'; // White
var last_color = '#000000';     // Black


window.addEventListener('load', load);
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
    background_color = 'white';
    ctx.strokeStyle = "black";
    last_color = 'black';
    pencil.style.fill = 'gray';
    rubber.style.fill = 'white';
    background.style.fill = 'white';
    fill.style.fill = 'white';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    show_color.style.fill = 'black';
}

// resize canvas
function resize() {
    canvas.width = window.innerWidth * 0.6;
    canvas.height = window.innerHeight;
}

function load() {
    canvas.width = window.innerWidth * 0.6;
    canvas.height = window.innerHeight;
    medium_pencil.style.fill = 'gray';
    ctx.lineWidth = "5";
    ctx.strokeStyle = "black";
    ctx.lineCap = "round";
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
    const old_Bkg_Color = HEXtoRGBA(background_color);
    console.log("old background:", old_Bkg_Color);
    background_color = ctx.strokeStyle;
    const new_Bkg_Color = HEXtoRGBA(background_color);
    console.log("new background:", new_Bkg_Color);

    for (var x = 0; x < canvas.width; x++) {
        for (var y = 0; y < canvas.height; y++) {
            if (checkColorMatch(colorLayer, x, y, old_Bkg_Color)) {
                colorPixel(colorLayer, x, y, new_Bkg_Color);
            }
        }
    }
    ctx.putImageData(colorLayer, 0, 0);
}

// new position from mouse event
function beginLine(e) {
    if (mode == 'pencil' || mode == 'rubber') {
        if (e.button == 1) {
            fillBackground()
        } else {
            pos.x = getX(e);
            pos.y = getY(e);

            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        }
    } else if (mode == 'fill') {
        bucketTool(e);
    }
}

function drawLine(e) {
    if (mode == 'pencil' || mode == 'rubber') {
        if (e.buttons !== 1) return;

        pos.x = getX(e);
        pos.y = getY(e);

        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.moveTo(pos.x, pos.y);
    }
}

function endLine(e) {
    if (mode == 'pencil' || mode == 'rubber') {
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
// Array comparison
const equals = (a, b) => JSON.stringify(a) === JSON.stringify(b);

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
    hex = hex.replace(/#/g, '');
    if (hex.length === 3) {
        hex = hex.split('').map(function (hex) {
            return hex + hex;
        }).join('');
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
