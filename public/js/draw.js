const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const coords = { x: 0, y: 0 }
var keeping_painting = false;
var stroke_color = 'black';

window.addEventListener('load', () => {

    // resizeWithoutClearing();
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.addEventListener('mousedown', (event) => {
        keeping_painting = true;
        coords.x = event.clientX - canvas.offsetLeft;
        coords.y = event.clientY - canvas.offsetTop;
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);

    });

    document.querySelectorAll('.pallette-btn').forEach(item => {
        // console.log('yoooo')
        item.addEventListener('click', event => {
            console.log('COlor: ' + event.target.style.backgroundColor)
            stroke_color = event.target.style.backgroundColor;
        })
    })


    document.addEventListener('mouseup', (event) => {
        keeping_painting = false;
        ctx.closePath();
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


