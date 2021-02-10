var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext('2d');

// last known position
var pos = { x: 0, y: 0 };
var rect = canvas.getBoundingClientRect();

var mode = 'pencil'; // pencil, fill
var background_color = 'white';
var last_color = 'black';
var offset_x;
var offset_y;

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
    ctx.strokeStyle = "white";
    fillBackground();
    ctx.strokeStyle = "black";
    last_color = 'black';
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
}

// fill background
function fillBackground() {
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    background_color = ctx.strokeStyle;
}

function getX(e) {
    return (e.clientX - offset_x);
}

function getY(e) {
    return (e.clientY - offset_y)
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
    }
}

function drawLine(e) {
    if (mode == 'pencil' || mode == 'rubber') {
        if (e.buttons !== 1) return;

        pos.x = getX(e);
        pos.y = getY(e);

        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        // ctx.beginPath();
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

// bucket tool (fill tool) from
// http://www.williammalone.com/articles/html5-canvas-javascript-paint-bucket-tool/
function bucketTool(e) {
    startX = getX(e)
    startY = getY(e)
    pixelStack = [[startX, startY]];
    var StartR = colorLayer.data[pixelPos];
    var StartG = colorLayer.data[pixelPos+1];
    var StartB = colorLayer.data[pixelPos+2];

    while(pixelStack.length)
    {
        var newPos, x, y, pixelPos, reachLeft, reachRight;
        newPos = pixelStack.pop();
        x = newPos[0];
        y = newPos[1];
        pixelPos = (y*canvasWidth + x);
        while(y-- >= rect.top && matchStartColor(pixelPos))
        {
            pixelPos -= canvas.width;
        }
        pixelPos += canvas.width;
        ++y;
        reachLeft = false;
        reachRight = false;
        while(y++ < rect.bot-1 && matchStartColor(pixelPos))
        {
            colorPixel(pixelPos);

            if(x > rect.left)
            {
                if(matchStartColor(pixelPos - 1))
                {
                    if(!reachLeft){
                        pixelStack.push([x - 1, y]);
                        reachLeft = true;
                    }
                }
                else if(reachLeft)
                {
                    reachLeft = false;
                }
            }

            if(x < rect.right-1)
            {
                if(matchStartColor(pixelPos + 1))
                {
                    if(!reachRight)
                    {
                        pixelStack.push([x + 1, y]);
                        reachRight = true;
                    }
                }
                else if(reachRight)
                {
                    reachRight = false;
                }
            }

            pixelPos += canvas.width;
        }
    }
    context.putImageData(colorLayer, 0, 0);

    function matchStartColor(pixelPos)
    {
        var r = colorLayer.data[pixelPos];
        var g = colorLayer.data[pixelPos+1];
        var b = colorLayer.data[pixelPos+2];

        return (r == StartR && g == StartG && b == Startb);
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

    function colorPixel(pixelPos)
    {
        var FillColorRGB = HEXtoRGB(ctx.strokeStyle);
        colorLayer.data[pixelPos] = FillColorRGB[0];
        colorLayer.data[pixelPos+1] = FillColorRGB[1];
        colorLayer.data[pixelPos+2] = FillColorRGB[2];
        colorLayer.data[pixelPos+3] = 255;
    }
}

var color_palette = document.getElementById('color_palette');
var colors = color_palette.getElementsByTagName('path');
//for (var i=0; i < colors.length; i++) {
//    colors[i].addEventListener('click', function(event) {
//        console.log(colors[3])
//        ctx.strokeStyle = colors[i].style.fill;
//    });
//}

colors[0].addEventListener('click', function(event) {
        if (mode == 'pencil') {
            ctx.strokeStyle = colors[0].style.fill;
            last_color = ctx.strokeStyle;
        } else if (mode == 'background') {
            ctx.strokeStyle = colors[0].style.fill;
            fillBackground();
            ctx.strokeStyle = last_color;
        }
    });
colors[1].addEventListener('click', function(event) {
        if (mode == 'pencil') {
            ctx.strokeStyle = colors[1].style.fill;
            last_color = ctx.strokeStyle;
        } else if (mode == 'background') {
            ctx.strokeStyle = colors[1].style.fill;
            fillBackground();
            ctx.strokeStyle = last_color;
        }
    });
colors[2].addEventListener('click', function(event) {
        if (mode == 'pencil') {
            ctx.strokeStyle = colors[2].style.fill;
            last_color = ctx.strokeStyle;
        } else if (mode == 'background') {
            ctx.strokeStyle = colors[2].style.fill;
            fillBackground();
            ctx.strokeStyle = last_color;
        }
    });
colors[3].addEventListener('click', function(event) {
        if (mode == 'pencil') {
            ctx.strokeStyle = colors[3].style.fill;
            last_color = ctx.strokeStyle;
        } else if (mode == 'background') {
            ctx.strokeStyle = colors[3].style.fill;
            fillBackground();
            ctx.strokeStyle = last_color;
        }
    });
colors[4].addEventListener('click', function(event) {
        if (mode == 'pencil') {
            ctx.strokeStyle = colors[4].style.fill;
            last_color = ctx.strokeStyle;
        } else if (mode == 'background') {
            ctx.strokeStyle = colors[4].style.fill;
            fillBackground();
            ctx.strokeStyle = last_color;
        }
    });
colors[5].addEventListener('click', function(event) {
        if (mode == 'pencil') {
            ctx.strokeStyle = colors[5].style.fill;
            last_color = ctx.strokeStyle;
        } else if (mode == 'background') {
            ctx.strokeStyle = colors[5].style.fill;
            fillBackground();
            ctx.strokeStyle = last_color;
        }
    });
colors[6].addEventListener('click', function(event) {
        if (mode == 'pencil') {
            ctx.strokeStyle = colors[6].style.fill;
            last_color = ctx.strokeStyle;
        } else if (mode == 'background') {
            ctx.strokeStyle = colors[6].style.fill;
            fillBackground();
            ctx.strokeStyle = last_color;
        }
    });
colors[7].addEventListener('click', function(event) {
        if (mode == 'pencil') {
            ctx.strokeStyle = colors[7].style.fill;
            last_color = ctx.strokeStyle;
        } else if (mode == 'background') {
            ctx.strokeStyle = colors[7].style.fill;
            fillBackground();
            ctx.strokeStyle = last_color;
        }
    });
colors[8].addEventListener('click', function(event) {
        if (mode == 'pencil') {
            ctx.strokeStyle = colors[8].style.fill;
            last_color = ctx.strokeStyle;
        } else if (mode == 'background') {
            ctx.strokeStyle = colors[8].style.fill;
            fillBackground();
            ctx.strokeStyle = last_color;
        }
    });
colors[9].addEventListener('click', function(event) {
        if (mode == 'pencil') {
            ctx.strokeStyle = colors[9].style.fill;
            last_color = ctx.strokeStyle;
        } else if (mode == 'background') {
            ctx.strokeStyle = colors[9].style.fill;
            fillBackground();
            ctx.strokeStyle = last_color;
        }
    });
colors[10].addEventListener('click', function(event) {
        if (mode == 'pencil') {
            ctx.strokeStyle = colors[10].style.fill;
            last_color = ctx.strokeStyle;
        } else if (mode == 'background') {
            ctx.strokeStyle = colors[10].style.fill;
            fillBackground();
            ctx.strokeStyle = last_color;
        }
    });
colors[11].addEventListener('click', function(event) {
        if (mode == 'pencil') {
            ctx.strokeStyle = colors[11].style.fill;
            last_color = ctx.strokeStyle;
        } else if (mode == 'background') {
            ctx.strokeStyle = colors[11].style.fill;
            fillBackground();
            ctx.strokeStyle = last_color;
        }
    });

small = document.getElementById('small');
small.addEventListener('click', function(event) {
    ctx.lineWidth = "1";
});

medium = document.getElementById('medium');
medium.addEventListener('click', function(event) {
    ctx.lineWidth = "5";
});

big = document.getElementById('big');
big.addEventListener('click', function(event) {
    ctx.lineWidth = "10";
});

huge = document.getElementById('huge');
huge.addEventListener('click', function(event) {
    ctx.lineWidth = "20";
});

rubber = document.getElementById('rubber');
rubber.addEventListener('click', function(event) {
    last_color = ctx.strokeStyle;
    ctx.strokeStyle = background_color;
    mode = 'rubber';
});

pencil = document.getElementById('pencil');
pencil.addEventListener('click', function(event) {
    ctx.strokeStyle = last_color;
    mode = 'pencil';
});

var background_btn = document.getElementById('background-btn');
background_btn.addEventListener('click', function(event) {
    mode = 'background';
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
