import express from "express";
import { User } from "../models/index.js";
import errorController from "../utils/errorController.js";
import auth from "../middlewares/auth.js";

const router = new express.Router();

//User Signup
router.get('/signup', (req, res) => {
    res.render('signup', {
        pageTitle: "Signup"
    });
});

//signup
router.post('/signup', async (req, res) => {
    try {
        const user = await User.create(req.body);

        req.session.user = {
            username: user.username,
            user_id: user.user_id,
            email: user.email,
        };
        req.session.isAuthenticated = true;

        res.cookie('username', user.username, {
            httpOnly: true,
            secure: true,
            sameSite: 'none', // Adjusted for cross-site compatibility
        });
        
        res.cookie('uid', user.user_id, {
            httpOnly: true,
            secure: true,
            sameSite: 'none', // Adjusted for cross-site compatibility
        });
        
        res.status(201).json({
            status: 'success',
            description: 'user created successfully'
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

//User Login
router.get('/login', (req, res) => {
    res.render('login', {
        pageTitle: "Login"
    });
});

router.post('/login', async (req, res) => {
    try {
        const whereClause = req.body.email ? {
            email: req.body.email
        } : {
            username: req.body.username
        }
        const user = await User.findOne({
            where: whereClause
        });

        if (!user) {
            return res.status(404).json({
                status: 'error',
                error: 'user does not exist'
            });
        };

        await user.compareHash(req.body.password);

        req.session.user = {
            username: user.username,
            user_id: user.user_id,
            email: user.email
        };

        req.session.isAuthenticated = true;

        res.cookie('username', user.username, {
            httpOnly: true,
            secure: true,
            sameSite: 'none', // Adjusted for cross-site compatibility
        });

        res.cookie('uid', user.user_id, {
            httpOnly: true,
            secure: true,
            sameSite: 'none', // Adjusted for cross-site compatibility
        });

        res.status(201).json({
            status: 'success',
            description: 'user logged in',
            user: req.session.user
        });
    }
    catch (err) {
        console.log(err);
        const error = errorController(err);
        res.status(error.statusCode).send({
            status : 'error',
            error: error.error
        });
    };
});

//Update
router.put('/updateUser', auth, async (req, res) => {
    try {
        const availableUpdates = ['username', 'email', 'password'];
        const requestedUpdates = Object.keys(req.body);
        const isValidUpdate = requestedUpdates.every((update) => {
            return availableUpdates.includes(update);
        });

        if (!isValidUpdate) {
            return res.status(404).json({
                status: 'error',
                description: 'invalid update requested'
            });
        };

        const updateDetails = {};

        requestedUpdates.forEach((update) => {
            updateDetails[update] = req.body[update];
        });

        await User.update(updateDetails, {
            where: {
                user_id: req.session.user.user_id
            },
            individualHooks: true
        });

        res.status(200).json({
            status: 'success',
            description: 'user details updated',
        });
    }
    catch (err) {
        console.log(err.message);
        res.status(400).json({
            status: 'error',
            description: 'an error occured'
        });
    };
});


//logout
router.get('/logout', auth, async (req, res) => {
    try {
        req.session.destroy(() => {
            console.log(`[SESSION] -- logged out and deleted session for user`);
        });
        res.status(200).json({
            status: 'success',
            description: 'user logged out'
        });
    }
    catch (err) {
        console.log(err.message);
        res.status(400).json({
            status: 'error',
            description: 'an error occured'
        });
    };
});

//logout
router.delete('/deleteUser', auth, async (req, res) => {
    try {
        const deletedUser = await User.destroy({
            where: {
                user_id: req.session.user.user_id
            }
        });

        if (deletedUser === 0) {
            return res.status(404).json({
                status: 'error',
                description: 'user does not exist!'
            });
        };

        req.session.destroy(() => {
            console.log(`[SESSION] -- User deleted session destroyed`);
        });

        res.status(200).json({
            status: 'success',
            description: 'user deleted successfully'
        });
    }
    catch (err) {
        console.log(err.message);
        res.status(400).json({
            status: 'error',
            description: 'an error occured'
        });
    };
});

export default router;