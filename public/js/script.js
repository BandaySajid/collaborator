const ws = new WebSocket('ws://127.0.0.1:9090');

function sendData(e){
    const data = {
        message : editor.getValue(),
    };
    ws.send(JSON.stringify(data));
}

ws.onmessage = (message) => {
    editor.setValue(JSON.parse(message.data).message);
};