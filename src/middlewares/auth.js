const auth = async (req, res, next) => {
    try {
        const isAuthenticated = req.session && req.session.isAuthenticated;

        if (!isAuthenticated) {
            if (req.headers['user-agent']) {
                return res.redirect('/');
            };
            return res.status(401).json(({
                status: 'unauthenticated',
                description: 'user not authenticated'
            }));

        };

        return next();

    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            status: 'error',
            error: 'internal server error'
        });
    };
};

export default auth;