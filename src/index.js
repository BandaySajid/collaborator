import express from 'express';
import redis from 'redis';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { userRouter, homeRouter, codeRouter } from './routes/index.js';
import gateway from './gateway/gateway.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import config from '../config.js';
import cookieParser from 'cookie-parser';
import { Code } from './models/index.js';

let redis_client = redis.createClient({ host: config.redis.host, port: 6379 });

await redis_client.connect();

const store = new RedisStore({
    client: redis_client
});

const viewsPath = path.join(__dirname, 'views');
const publicPath = path.join(__dirname, '../', 'public');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static(publicPath));
app.set('views', viewsPath);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(config.cookie.secret))

// app.use(cors({
//     origin: '*'
// }));


const maxAgeInSeconds = 2592000;

const sessionMiddleware = session({
    store: store,
    secret: config.cookie.secret,
    resave: false,
    cookie: {
        sameSite: true,
        httpOnly: true,
        maxAge: maxAgeInSeconds * 1000
    },
    saveUninitialized: false
});

app.use(sessionMiddleware);

app.use(homeRouter);
app.use(userRouter);
app.use(codeRouter);

const server = app.listen(config.ports.app, () => {
    console.log(`server is up on port : ${config.ports.app}`);
});

server.on('upgrade', async (request, socket, head) => {
    console.log('got an upgrade request');

    sessionMiddleware(request, {}, async () => {

        const isAuthenticated = request.session && request.session.isAuthenticated;

        if (!isAuthenticated) {
            return socket.destroy('user not authenticated');
        };

        gateway.handleUpgrade(request, socket, head, function done(ws) {
            ws.user = request.session.user;
            gateway.emit('connection', ws, request);
        });
    });
});