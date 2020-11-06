module.exports = {
    port: process.env.WEB5_PORT,
    sessionSecret: process.env.WEB5_SESSION_SECRET,
    mongodb: {
        connectionString: process.env.WEB5_MONGODB_CONNECTION_STRING
    }
};