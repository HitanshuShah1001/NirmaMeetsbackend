const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema({

    Name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true,
        unique:[true,"Email already exists!"]
    },

    password:{
        type:String,
        required:true
    },

    Department:{
        type:String,
    },
    
})


module.exports =  mongoose.model("Users", UserSchema);