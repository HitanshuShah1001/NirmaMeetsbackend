const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema({

    Name:{
        type:String,
        required:true
    },

    Username:{
        type:String,
        required:true,
        unique:true
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

    Profilephoto: {
        type:String,
        default:''
    },

    Field:{
        type:String,
    },
    
})


module.exports =  mongoose.model("Users", UserSchema);