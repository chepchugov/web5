const {Schema, model} = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const usernamePattern = /^[a-zA-Z0-9_]{4,64}$/;
const passwordPattern = /.{4,64}/;
const usernameMaxLength = 64;
const passwordMaxLength = 64;

const schema = new Schema({
    tasks: [{
        title: String,
        description: String,
        isDone: Boolean
    }]
});
schema.statics.usernamePattern = usernamePattern;
schema.statics.passwordPattern = passwordPattern;
schema.statics.usernameMaxLength = usernameMaxLength;
schema.statics.passwordMaxLength = passwordMaxLength;
schema.statics.testUsername = username => usernamePattern.test(username);
schema.statics.testPassword = password => passwordPattern.test(password);
schema.plugin(passportLocalMongoose);

module.exports = model('user', schema);