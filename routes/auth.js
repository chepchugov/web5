const express = require('express');
const {ensureNotLoggedIn} = require('connect-ensure-login');
const passport = require('passport');

const {User} = require('../database');

const router = express.Router();
router.get('/auth', (req, res) => {
    if (req.user) {
        return res.json({success: true});
    }
    return res.json({success: false});
});
router.post('/login', ensureNotLoggedIn('/'), async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    const {error} = await User.authenticate()(username, password);
    if (error) {
        if (error.name === 'IncorrectUsernameError') {
            return res.json({success: false, reason: 'IncorrectCredentials'});
        }
        if (error.name === 'IncorrectPasswordError') {
            return res.json({success: false, reason: 'IncorrectCredentials'});
        }
        return next(error);
    }
    passport.authenticate('local')(req, res, () => {
        res.json({success: true});
    });
});
router.post('/signup', ensureNotLoggedIn('/'), async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!User.testUsername(username)) {
        return res.json({success: false, reason: 'MismatchingUsername'});
    }
    if (!User.testPassword(password)) {
        return res.json({success: false, reason: 'MismatchingPassword'});
    }
    try {
        await User.register({username: username, isAdmin: false}, password);
        passport.authenticate('local')(req, res, () => {
            res.json({success: true});
        });
    } catch (err) {
        if (err.name === 'UserExistsError') {
            return res.json({success: false, reason: 'UserExists'});
        }
        return next(err);
    }
});
router.get('/logout', (req, res) => {
    req.logout();
    return res.json({success: true});
});

module.exports = router;
