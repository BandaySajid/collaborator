const codeElement = document.getElementById('code');
const inviteLinkElement = document.getElementById('inviteLink');

const ws = new WebSocket('ws://127.0.0.1:8001/code');

ws.onclose = function (event) {
    console.log('connection closed, reason:', event.reason);
    showAlert({
        status: 'error',
        error: event.reason
    }, 5000);
};

function sendCursor(event) {
    let x = event.clientX;
    let y = event.clientY;
    ws.send(JSON.stringify({
        code: 'cursor',
        payload: {
            x, y
        }
    }));
};

function disableButton(e, timer) {
    const myButton = document.getElementById(e.target.id);

    myButton.disabled = true;

    setTimeout(() => {
        myButton.disabled = false;
    }, timer);
}

async function saveCode(e) {
    try {
        disableButton(e, 6000);
        const resp = await fetch('/api/code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: codeElement.innerText
            })
        });

        const saveCodeResp = await resp.json();
        showAlert(saveCodeResp, 3000);
    } catch (error) {
        console.log(error);
    }
};

function copyToClipboard(textToCopy, desc) {
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            showAlert({
                status: 'success',
                description: desc
            }, 3000);
        })
        .catch((error) => {
            console.error("Error copying text to clipboard:", error);
        });
};

async function showInviteLink(e) {
    try {
        disableButton(e, 6000);
        const resp = await fetch('/api/code/invite', {
            method: "GET"
        });

        const inviteLink = await resp.json();

        document.querySelector('#url-link').innerText = inviteLink.data;
        copyToClipboard(inviteLink.data, 'Link copied to clipboard');
    }
    catch (err) {
        console.log(err);
    }
};


function getCursor(x, y, name) {
    const infoElement = document.getElementById('info');
    infoElement.innerHTML = `<span>${name}<span>`;
    infoElement.style.top = y + "px";
    infoElement.style.left = (x + 20) + "px";
};

ws.onerror = function (err) {
    console.error('Error with websocket client:', err);
};

ws.onmessage = function (message) {
    try {
        const msg = JSON.parse(message.data);
        switch (msg.code) {
            case 'code':
                codeElement.innerText = msg.payload.code;
                break;
            case 'cursor':
                getCursor(msg.payload.x, msg.payload.y, msg.client.name);
                break;
            case 'join':
                const code = codeElement.innerText;
                ws.send(JSON.stringify({
                    code: 'code',
                    payload: {
                        code: code
                    }
                }));
                break
            case 'error':
                console.error(msg.error);
        }
    }
    catch (err) {
        //invalid json
    }
};

codeElement.addEventListener('input', () => {
    const code = codeElement.innerText;
    const msg = JSON.stringify({
        code: 'code',
        payload: {
            code: code.length > 0 ? code : ' '
        }
    });
    ws.send(msg);
});