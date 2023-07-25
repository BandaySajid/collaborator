import express from 'express';
import auth from '../middlewares/auth.js';
import { Code } from '../models/index.js';
import errorController from '../utils/errorController.js';
import config from '../../config.js';

const router = new express.Router();

router.get('/code/:id', auth, async (req, res) => {
    const id = req.params.id;

    const code = await Code.findOne({
        where: {
            invite_url: req.params.id
        }
    });

    if (!code) {
        return res.status(404).send('<h1>404 Code not found<h1>');
    };

    req.session.user.joinRoom = id;

    return res.render('code', {
        pageTitle: `Code-${id}`,
        code: code.content
    });
});

router.get('/code', auth, async (req, res) => {
    let code = await Code.findOne({
        where: {
            user_id: req.session.user.user_id
        }
    });

    if (!code) {
        code = `function greet() {
            console.log('hello world');
        }`
    }
    else {
        code = code.content;
    };

    req.session.user.joinRoom = undefined;
    res.render('me', {
        pageTitle: 'Code',
        code
    });
});

//save Code
router.post('/api/code', auth, async (req, res) => {
    try {
        const user_id = req.session.user.user_id;
        const code = await Code.findOne({
            where: {
                user_id
            }
        });

        if (!code) {
            await Code.create({ ...req.body, user_id });
        }
        else {
            await Code.update(req.body, {
                where: { user_id }
            });
        }
        res.status(201).json({
            status: 'success',
            description: 'code saved successfully'
        });
    }
    catch (err) {
        console.log(err);
        const error = errorController(err);
        res.status(error.statusCode).send({
            error: error.error
        });
    };
});

router.get('/api/code', auth, async (req, res) => {
    try {
        const code = await Code.findOne({
            where: {
                user_id: req.session.user.user_id
            }
        });

        if (!code) {
            return res.status(404).json({
                status: 'error',
                error: 'code does not exist'
            });
        };

        res.status(200).json({
            status: 'success',
            code
        });
    }
    catch (err) {
        console.log(err);
        const error = errorController(err);
        res.status(error.statusCode).send({
            error: error.error
        });
    }
});

router.get('/api/code/invite', auth, async (req, res) => {
    try {
        const user_id = req.session.user.user_id;
        const code = await Code.findOne({
            where: {
                user_id
            }
        });

        if (!code) {
            return res.status(404).json({
                status: 'error',
                description: 'no code for user'
            });
        };

        const uid = req.session.user.user_id.split('-')[0];

        const invite_url = `${config.urls.app}/code/${uid}`;

        await Code.update({
            invite_url: uid
        }, {
            where: {
                user_id
            }
        });
        res.status(200).json({
            status: 'success',
            data: invite_url
        });
    }
    catch (err) {
        console.log(err);
        const error = errorController(err);
        res.status(error.statusCode).send({
            error: error.error
        });
    }
});

export default router;