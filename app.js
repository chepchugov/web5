const passport = require('passport');
const morgan = require('morgan');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo')(expressSession);
const mongoose = require('mongoose');

const {User} = require('./database');
const config = require('./config');
const authRouter = require('./routes/auth');
const tasksRouter = require('./routes/tasks');
const indexRouter = require('./routes/index');

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const app = express();

app.use(morgan('tiny'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.use(expressSession({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: mongoose.connection,
        autoRemove: 'interval',
        autoRemoveInterval: 60
    }),
    cookie: {maxAge: 24 * 60 * 60 * 1000}
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', authRouter);
app.use('/api/tasks', tasksRouter);
app.use('*', indexRouter);

/*app.use(function (err, req, res) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});*/

module.exports = app;
