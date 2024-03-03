

const mongoose = require("mongoose");
const moment = require('moment');

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
    LicenceNo: {
        type: String,
        required: true,
    },
    LLRType: {
        type: [String],
    },
    Type: {
        type: String,
    },
    AddmissionDate: {
        type: Date,
        default: Date.now,
        set: function(value) {
            // If the value is a valid date string, parse it and return the Date object
            if (typeof value === 'string') {
              const parsedDate = moment(value, 'DD-MM-YYYY');
              return parsedDate.isValid() ? parsedDate.toDate() : value;
            }
            return value;
          },
    
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
    MDLStatus: {
        type: String,
    }
});

const feeStructureSchema = new mongoose.Schema({
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
    AddmissionDate: {
        type: Date,
        default: Date.now,
        set: function(value) {
            // If the value is a valid date string, parse it and return the Date object
            if (typeof value === 'string') {
              const parsedDate = moment(value, 'DD-MM-YYYY');
              return parsedDate.isValid() ? parsedDate.toDate() : value;
            }
            return value;
          },
    
    },
    LLRType: {
        type: [String],
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
    /*
    pending: [
        {
            Installment-1st:
            {
                type:Number,

            },
            Installment-2nd:
            {
                type:Number,
                
            },
            Installment-3rd:
            {
                type:Number,
                
            }
        }
    ]
    */
    LLFee:{
        type:Number
    },
    DLFee:{
        type:Number
    },
    GForm:{
        type:Number
    },
    Balance:{
        type:Number
    }
});

const Student = mongoose.model("Student", studentSchema);
const FeeStructure = mongoose.model("FeeStructure", feeStructureSchema);

module.exports = { Student, FeeStructure };
