const { WebSocketServer } = require('ws');
const path = require('path');
const ejs = require('ejs');
const userRouter = require('./routes/user');

const PORT = process.env.PORT || 9090;
const publicPath = path.join(__dirname, '../public/');
const viewsPath = path.join(__dirname, '../templates/views/');

const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.set('views', viewsPath);
app.use(express.static(publicPath));
app.use(express.urlencoded({extended : true}));
app.use(userRouter);

const server = app.listen(PORT, ()=>{
    console.log('server is running on port http://127.0.0.1:'+PORT);
});

const wsServer = new WebSocketServer({
    server : server
});

wsServer.on('connection', (socket)=>{
    console.log('a client connected to the socket server');
    socket.on('message', (msg)=>{
        const message = msg.toString('utf-8')
        // console.log(message);
        wsServer.clients.forEach((client)=>{
            if(client !== socket){
                client.send(message);
            }
        })
    })
});

