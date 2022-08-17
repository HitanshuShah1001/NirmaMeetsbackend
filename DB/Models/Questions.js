const mongoose = require("mongoose");


const QuestionSchema = new mongoose.Schema({


    Username:{
        type:String,
        required:true,
    },

    question:{
        type:String,
        required:true,
    },

    Field:{
        type:String,
        required:true
    },

    Date:{
        type : Date,
        required:true
    },
    
})


module.exports =  mongoose.model("Questions", QuestionSchema);