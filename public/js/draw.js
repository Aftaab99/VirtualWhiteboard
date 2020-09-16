const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const coords = { x: 0, y: 0 };
const textBoxCoords = { x: 0, y: 0 };

var keeping_painting = false;
var stroke_color = 'black';
var current_mode = 'pen';
var stroke_size = 1;
var font_size = 24;

import PriorityQueue from './priority-queue.js'
import { getParams } from './utility.js'

window.addEventListener('load', () => {

    const socket = io();
    const pq = new PriorityQueue();
    const roomId = getParams(window.location.href).roomId;
    const currentColorIndicator = document.getElementById('current-color-indicator');

    const textbox = document.getElementById('text-box');
    const textarea = document.getElementById('text-area');
    const textSubmitBtn = document.getElementById('text-box-submit-btn');

    socket.emit('create-room', roomId);

    function sendWhiteboardData() {
        let whiteboardContents = canvas.toDataURL('image/png', 0.9);
        let sendObj = { roomId: roomId, data: whiteboardContents, time: Date.now() };
        socket.emit("send-data", sendObj);
    }

    function setWhiteboardData(dataUrl) {
        let img = new Image();
        img.onload = () => {
            ctx.fillStyle = 'white';
            ctx.drawImage(img, 0, 0);
        }
        console.log(dataUrl.substring(15));
        img.src = dataUrl;
    }

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

    let interval = null;

    let c = 0;
    // resizeWithoutClearing();
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.addEventListener('mousedown', (event) => {
        keeping_painting = true;
        ctx.lineWidth = stroke_size;
        if (interval == null)
            interval = setInterval(sendWhiteboardData, 250);
        coords.x = event.clientX - canvas.offsetLeft;
        coords.y = event.clientY - canvas.offsetTop;
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
    });

    document.getElementById('eraser-btn').addEventListener('click', (e) => {
        textbox.style.setProperty('visibility', 'hidden');
        current_mode = 'eraser';
    })

    document.getElementById('pen-btn').addEventListener('click', (e) => {
        textbox.style.setProperty('visibility', 'hidden');
        current_mode = 'pen';
    })

    document.getElementById('text-btn').addEventListener('click', (e) => {
        textbox.style.setProperty('visibility', 'hidden');
        current_mode = 'text';
    })

    document.querySelectorAll('.pallette-btn').forEach(item => {
        item.addEventListener('click', event => {
            stroke_color = event.target.style.backgroundColor;
            currentColorIndicator.style.setProperty('background-color', stroke_color);
            current_mode = 'pen';
        })
    })

    document.getElementById('stroke-width-menu').addEventListener('change', (e) => {
        console.log('yooo')
        stroke_size = parseInt(e.target.selectedOptions[0].text);
    });

    document.getElementById('font-size-menu').addEventListener('change', (e) => {
        console.log('yooo')
        font_size = parseInt(e.target.selectedOptions[0].text);
        textarea.style.setProperty('font-size', font_size + 'px');

    });

    canvas.addEventListener('click', (e) => {
        if (current_mode != 'text')
            return;
        textBoxCoords.x = event.clientX;
        textBoxCoords.y = event.clientY;
        textbox.style.setProperty('font-size', font_size + 'px');
        textbox.style.setProperty('left', textBoxCoords.x + 'px');
        textbox.style.setProperty('top', textBoxCoords.y + 'px');
        textbox.style.setProperty('visibility', 'visible');
    });
    document.addEventListener('mouseup', (event) => {

        keeping_painting = false;
        ctx.closePath();
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
    });
    document.addEventListener('mousemove', (event) => {

        if (!keeping_painting) return;
        // New position
        coords.x = event.clientX - canvas.offsetLeft;
        coords.y = event.clientY - canvas.offsetTop;

        if (current_mode == 'pen') {
            ctx.strokeStyle = stroke_color;
            ctx.lineTo(coords.x, coords.y);
            ctx.stroke();
        }
        else {
            ctx.strokeStyle = 'white';
            ctx.lineTo(coords.x, coords.y);
            ctx.stroke();
            ctx.strokeStyle = stroke_color;
        }
        // ctx.closePath();
    });

    textSubmitBtn.addEventListener('click', (e) => {
        let text = textarea.value;
        textbox.style.setProperty('visibility', 'hidden');
        ctx.fillStyle = stroke_color;
        ctx.font = font_size + "px Arial";
        ctx.fillText(text, textBoxCoords.x - canvas.offsetLeft, textBoxCoords.y - canvas.offsetTop);

        if (interval == null)
            sendWhiteboardData();
    })

    window.addEventListener('resize', (event) => {
        resizeWithoutClearing();
    });

    socket.on('set-initial-whiteboard', dataUrl => {
        setWhiteboardData(dataUrl);
    })
    socket.on('receive-data', data => {
        console.log(`Got some data from server with time ${data.time}`);
        console.log(Object.keys(data));
        pq.add(data);
    });

    let updateBoardInterval = setInterval(() => {
        if (!pq.isEmpty()) {
            let data = pq.pop();
            setWhiteboardData(data.data);
        }
    }, 500);

});


