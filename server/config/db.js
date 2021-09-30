const mongoose = require("mongoose");
const config = require("config");

const db = config.get('mongoURI');

const connectDB = async function () {
    try {
        await mongoose.connect(db);
        console.log("Mongodb connected");

    }
    catch(err) {
        console.error(`Error found ${err.message}`);
        process.exit(1);//exiting an asynchronous function process with an uncaught fatal error shown by the number 1.
    }
}

module.exports = connectDB;