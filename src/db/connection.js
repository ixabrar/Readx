const mongoose = require('mongoose');



let connectionString;

module.exports = {
    connectToDatabase: async function (newConnectionString) {
        if (mongoose.connection.readyState !== 0) {
            // If a connection is open, close it before opening a new one
            await mongoose.connection.close();
        }

        console.log('inside the Connection.js file');
        connectionString = newConnectionString;
        
        return mongoose.connect(connectionString, {
          
        });
    },
    getConnectionString: function () {
        return connectionString;
    }
};
