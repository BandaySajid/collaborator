import express from "express";

const router = new express.Router();

router.get("/", (req, res) => {
    res.render('home', {
        pageTitle : 'Home'
    });
});

export default router;