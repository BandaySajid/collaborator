export default {
    environment: process.env.APPENV || 'development',
    ports: {
        app: 8001,
        gateway: 8002
    },
    urls: {
        app: 'http://127.0.0.1:2018',
        gateway: 'ws://127.0.0.1:2019',
    },
    database: {
        username: 'user',
        password: 'pass',
        database: 'collaborator',
        host: 'mysql',
        dialect: 'mysql',
        logging: false,
    }
};