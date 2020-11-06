const mongoose = require('mongoose');

const config = require('../config');
const User = require('./user');

mongoose.connect(
    config.mongodb.connectionString,
    {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    }
);

module.exports = {User: User};