const mongoose = require('mongoose');
let connectionString;

module.exports = {
    connectToDatabase: async function (newConnectionString) {
        if (mongoose.connection.readyState !== 0) {
            // If a connection is open, close it before opening a new one
            await mongoose.connection.close();
        }
        console.log("Inside the connectToDatabase function");
        connectionString = newConnectionString;
        try {
            await mongoose.connect(connectionString, {
            });
            console.log("Connected to MongoDB");
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
            throw error;
        }
    },
    getConnectionString: function () {
        return connectionString;
    }
};
