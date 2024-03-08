const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const moment = require('moment');



const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  Conn1: {
    type: String,
  },
  Conn2: {
    type: String,
  },
  Conn3: {
    type: String,
  },
  Conn4: {
    type: String,
  },
  NO: {
    type: Number,
  },
  Image: {
    data: Buffer,
    contentType: String,
  },
});


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


userSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = bcrypt.hashSync(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};


const Student = mongoose.model("Student", studentSchema);
const FeeStructure = mongoose.model("FeeStructure", feeStructureSchema);
const userModel = mongoose.model("user", userSchema);

module.exports = {Student,FeeStructure,userModel};
