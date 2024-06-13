const mongoose = require("mongoose");
const moment = require('moment');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
    ID: {
        type: Number,
        required: true,
        unique: true 
    },
    Name: {
        type: String,
        required: true,
    },
    MobNo: {
        type: Number,
        required: true,
    },
    SAddmissionDate: {
        type: Date,
        default: Date.now,
    
    },
    EAddmissionDate: {
        type: Date
    },
    Total: {
        type: Number,
        required: true,
    },
    Deposite: {
        type: Number,
        required: true,
    },
    Pending: {
        type: Number,
    },
    Photo: {
        type: Buffer,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female']
    },
    Type : {
        type : String,
    }
});



const userSchema = new mongoose.Schema({
   
    name: {
        type:String
    },

    username: { type: String,
                required: true,
                unique: true 
            },
    password: { type: String,
                required: true
             },
    connstring: {
                type : String
    },
    mobno:{
        type:Number
    },
    cname : {
        type:String
    },
    BusinessName : {
        type : String
    },
    BusinessAddress: {
        type : String
    },
    Photo :{
        type:Buffer
    }    
});


const User = mongoose.model('user', userSchema);
const Student = mongoose.model("Student", studentSchema);


module.exports = { Student , User };