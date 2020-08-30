const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const coords = { x: 0, y: 0 }
var keeping_painting = false;
var stroke_color = 'black';

window.addEventListener('load', () => {

    const socket = io();
    function sendWhiteboardData() {
        socket.emit("send-data", "Hello from client " + (++c))
    }
    let interval = null;

    let c = 0;
    // resizeWithoutClearing();
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.addEventListener('mousedown', (event) => {
        keeping_painting = true;
        if(interval==null)
            interval = setInterval(sendWhiteboardData, 250);
        coords.x = event.clientX - canvas.offsetLeft;
        coords.y = event.clientY - canvas.offsetTop;
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
    });

    document.querySelectorAll('.pallette-btn').forEach(item => {
        item.addEventListener('click', event => {
            stroke_color = event.target.style.backgroundColor;
        })
    })

    document.addEventListener('mouseup', (event) => {
        keeping_painting = false;
        ctx.closePath();
        if(interval){
            clearInterval(interval);
            interval = null;
        }
    });
    document.addEventListener('mousemove', (event) => {
        if (!keeping_painting) return;
        // New position
        coords.x = event.clientX - canvas.offsetLeft;
        coords.y = event.clientY - canvas.offsetTop;

        ctx.strokeStyle = stroke_color;
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
        // ctx.closePath();
    });
    window.addEventListener('resize', (event) => {
        resizeWithoutClearing();
    });

    function resizeWithoutClearing() {
        let temp_canvas = document.createElement('canvas');
        let temp_context = temp_canvas.getContext('2d');
        temp_canvas.width = window.innerWidth;
        temp_canvas.height = window.innerHeight;
        temp_context.fillStyle = 'white';
        temp_context.fillRect(0, 0, window.innerWidth, window.innerHeight);
        temp_context.drawImage(canvas, 0, 0);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.drawImage(temp_canvas, 0, 0);
    }

});


