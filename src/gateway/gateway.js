import { WebSocketServer } from "ws";
import config from "../../config.js";

// const CODE_PING = 'ping';
const CODE_REGISTER = 'register';

function socketErrorMessage(socket, err) {
    socket.send(JSON.stringify({
        code: 'error',
        error: err
    }))
    console.error(errMessage);
};

const CLIENTS = {};

const wss = new WebSocketServer({ noServer: true, path: '/code' });

wss.on('connection', (socket) => {

    socket.uuid = socket.user.user_id.split('-')[0];

    console.log(`client with id : ${socket.uuid} joined!`);

    const userJoinRoomId = socket.user.joinRoom;

    let host;

    if (userJoinRoomId) {
        host = CLIENTS[userJoinRoomId];

        if (!host) {
            console.log('connection closed : host of this code is not online!');
            return socket.close(1008, 'connection closed : host of this code is not online!');
        };

        if (Object.keys(host.room).length >= 2) {
            console.log('connection closed : Room is full');
            return socket.close(1007, 'connection closed : Room is full');
        };

        host.room[socket.uuid] = socket;
    }
    else {
        CLIENTS[socket.uuid] = {
            uuid: socket.uuid,
            name: socket.user.username,
            room: { [socket.uuid]: socket }
        };
    };

    socket.send(JSON.stringify({
        code: CODE_REGISTER,
        payload: {
            uuid: socket.uuid
        }
    }));

    const currentClient = {
        uuid: socket.uuid,
        name: socket.user.username
    };

    wss.clients.forEach((client) => {
        if (client.uuid !== socket.uuid) {
            client.send(JSON.stringify({
                code: 'join',
                payload: {}
            }));
        };
    });

    socket.on('message', (message) => {
        try {
            message = JSON.parse(message.toString());

            console.log(`message from client: ${socket.uuid} :`, message);
            if (message.code === 'code') {
                if (message.payload.code) {
                    message.client = currentClient;
                    if (host) {
                        return Object.values(CLIENTS[userJoinRoomId].room).forEach((client) => {
                            if (client.uuid !== socket.uuid) {
                                client.send(JSON.stringify(message));
                            };
                        });
                    }
                    return Object.values(CLIENTS[socket.uuid].room).forEach((client) => {
                        if (client.uuid !== socket.uuid) {
                            client.send(JSON.stringify(message));
                        };
                    });
                }
                const errMessage = 'invalid socket message, type : code';
                socketErrorMessage(socket, errMessage);
                return
            };

            if (message.code === 'cursor') {
                if (message.payload.x && message.payload.y) {
                    message.client = currentClient;
                    if (host) {
                        return Object.values(CLIENTS[userJoinRoomId].room).forEach((client) => {
                            if (client.uuid !== socket.uuid) {
                                client.send(JSON.stringify(message));
                            };
                        });
                    }
                    return Object.values(CLIENTS[socket.uuid].room).forEach((client) => {
                        if (client.uuid !== socket.uuid) {
                            client.send(JSON.stringify(message));
                        };
                    });

                }
                const errMessage = 'invalid socket message, type : cursor';
                socketErrorMessage(socket, errMessage);
                return;
            };

            if (message.code === 'join') {
                message.client = currentClient;
                if (host) {
                    return Object.values(CLIENTS[userJoinRoomId].room).forEach((client) => {
                        if (client.uuid !== socket.uuid) {
                            client.send(JSON.stringify(message));
                        };
                    });
                }
                return Object.values(CLIENTS[socket.uuid].room).forEach((client) => {
                    if (client.uuid !== socket.uuid) {
                        client.send(JSON.stringify(message));
                    };
                });

            };

            const errMessage = 'invalid socket message, type : universal';

            socketErrorMessage(socket, errMessage);
        }
        catch (err) {

        };
    });

    socket.on('close', (code, reason) => {
        if (code !== 1007 || code !== 1008) {
            if (host) {
                Object.values(CLIENTS[userJoinRoomId].room).forEach((client) => {
                    if (client.uuid !== socket.uuid) {
                        client.send(JSON.stringify({
                            code: 'left',
                            payload: {}
                        }));
                    };
                });
                delete CLIENTS[userJoinRoomId].room[socket.uuid];
            }
            else {
                delete CLIENTS[socket.uuid];
            };
            console.log(`client with id: ${socket.uuid} left!`);
            delete CLIENTS[socket.uuid];
        }
        console.log(`connection for client with id: ${socket.uuid} closed by the server!\nReason: ${reason}`);
    });

});

wss.on('error', (err) => {
    console.log('Error with websocket server:', err);
});

export default wss;