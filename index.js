const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require('./auth');
require('dotenv').config()
const mongoose = require('mongoose')
const Users = require('./DB/Models/Users.js');



app.use(bodyParser.json())

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    next();
  });

  

const DB = 'mongodb+srv://Hitanshu:hitz200110@cluster0.fpc53gv.mongodb.net/AuthNM?retryWrites=true&w=majority'

mongoose.connect(DB, {
    useNewUrlParser: true,
     useUnifiedTopology: true,

}).then(() =>{
    console.log('Database connected..')
})
const PORT = process.env.PORT || 443;


app.listen(PORT ,() => {
    console.log('Server is running');
})


app.get('/',(req,res) => {
    res.json({message:'Welcome to Nirmameets!'})
})

app.post('/register',(req,res) => {
    bcrypt.hash(
        req.body.password,10
    ).then((hashedPassword) => {
        const user = new Users({
            Name:req.body.Name,
            email:req.body.email,
            password:hashedPassword,
            Department:req.body.Department,
        });
        user
        .save().then((result) => {
            res.status(201).send({
                message:'User created succesfully',
                result
            })
        }).catch((error) => {
            res.status(500).send({
                message:'Some error occured',
                error
            })
        })
    }).catch(error => {
        res.status(500).send({
            message:'Password was not hashed succesfully',
            error
        })
    })
})


app.post('/login',(req,res) => {
    Users.findOne({email:req.body.email}).then(user => {
        console.log(user);
        bcrypt.compare(req.body.password,user.password).then(passwordcheck => {
            if(!passwordcheck){
                res.status(400).send('Passwords do not match!');

            }
            
            const token = jwt.sign({
                data: user.email
              }, 'secret', { expiresIn: '24h' });
            res.status(200).send({
                message:'Login Succesful',
                email:user.email,
                Name:user.Name,
                Department:user.Department,
                token
                
            })
        }).catch(error => {
            res.status(400).send({
                message:'Some error occured',
                error
            })
        }) 
    }).catch(error => {
        res.status(404).send({
            message:'Email not found',
            error
        })
    })
})


app.get("/free-endpoint", (request, response) => {
    response.json({ message: "You are free to access me anytime" });
  });
  
  // authentication endpoint
  app.get("/auth-endpoint", auth, (request, response) => {
    response.json({ message: "You are authorized to access me" });
  });

