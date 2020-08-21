window.addEventListener('load', (ev) => {
    const inputField = document.getElementById('host-name');
    const createRoomBtn = document.getElementById('create-room-btn');

    createRoomBtn.addEventListener('click', (e) => {
        e.preventDefault();
        let inputText = inputField.value;
        if (inputText === '') {
            inputText = 'Anonymous';
        }
        inputField.value = 'Anonymous';

        let xhr = XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById("room-url").innerHTML = this.resposeText;
            }
        };
        xhr.open('POST', '/create-room', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({ username: inputText }));
        
    })
})