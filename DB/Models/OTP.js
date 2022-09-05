const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({

    email:String,
    code:String,
    expiresIn:Number

},{
    timestamps:true
})

module.exports =  mongoose.model("OTP", OTPSchema);