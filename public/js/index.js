window.addEventListener('load', (ev) => {
    const inputField = document.getElementById('host-name');
    const createRoomBtn = document.getElementById('create-room-btn');
    const copyBtn = document.getElementById('copy-link-btn');
    const roomLinkField = document.getElementById('room-link');
    createRoomBtn.addEventListener('click', (e) => {
        e.preventDefault();
        let inputText = inputField.value;

        if (inputText === '') {
            inputText = 'Anonymous';
            inputField.value = 'Anonymous';
        }

        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                let response = JSON.parse(this.response);
                if (response.err) {
                    document.getElementById('err-message').innerHTML = response.err_msg;
                    document.getElementById('err-message').style.visibility = 'visible';
                }
                else {
                    document.getElementById("room-link").value = response.url;
                    document.getElementById("room-link-container").style.visibility = 'visible';
                }
            }
        };
        xhr.open('POST', '/create-room', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({ username: inputText }));
    });

    copyBtn.addEventListener('click', (e)=>{
        roomLinkField.select();
        roomLinkField.setSelectionRange(0, 150);
        document.execCommand("copy");
    })
})