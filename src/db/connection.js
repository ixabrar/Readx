const mongoose = require('mongoose');


/*
mongoose.connect("mongodb+srv://AbrarShaikh:Andy%40998@cpp.csyvxe0.mongodb.net/GULSHAN_2024",
//mongoose.connect("mongodb+srv://Junaid_Shaikh:Gulshan%40Junaid@cluster0.dgrgpxv.mongodb.net/GMDS", 
{
    
}).then(() => {
    console.log('Connection successful');
}).catch((error) => {
    console.error('Connection failed:', error);
});
*/

let connectionString;

module.exports = {
    connectToDatabase: async function (newConnectionString) {
        if (mongoose.connection.readyState !== 0) {
            // If a connection is open, close it before opening a new one
            await mongoose.connection.close();
        }

        connectionString = newConnectionString;

        return mongoose.connect(connectionString, {
          
        });
    },
    getConnectionString: function () {
        return connectionString;
    }
};
