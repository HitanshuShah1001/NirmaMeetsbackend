const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("./auth");
require("dotenv").config();
const mongoose = require("mongoose");
const Users = require("./DB/Models/Users.js");
const Questions = require("./DB/Models/Questions.js");
const Answer = require("./DB/Models/Answers");

app.use(bodyParser.json());

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

const DB =
  "mongodb+srv://Hitanshu:hitz200110@cluster0.fpc53gv.mongodb.net/AuthNM?retryWrites=true&w=majority";

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected..");
  });
const PORT = process.env.PORT || 443;

app.listen(PORT, () => {
  console.log("Server is running");
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Nirmameets!" });
});

app.post("/register", (req, res) => {
  Users.find({ email: req.body.email.toLowerCase() }).then((user) => {
    if (user[0]!==undefined) {
       res.send({ message: "Email already registered!" });
    } else {
      Users.find({ Username: req.body.Username }).then((user) => {
        if (user[0]!==undefined) {
           res.send({ message: "Username already exists" });
        } else {
          bcrypt
            .hash(req.body.password, 10)
            .then((hashedPassword) => {
              const user = new Users({
                Name: req.body.Name,
                Username: req.body.Username,
                email: req.body.email.toLowerCase(),
                password: hashedPassword,
                Field: req.body.Field,
              });
              user
                .save()
                .then((result) => {
                  res.status(201).send({
                    message: "User created succesfully",
                    result,
                  });
                })
                .catch((error) => {
                  res.status(500).send({
                    message: "Some error occured",
                    error,
                  });
                });
            })
            .catch((error) => {
              res.status(500).send({
                message: "Password was not hashed succesfully",
                error,
              });
            });
        }
      });
    }
  });
});

app.post("/login", (req, res) => {
  console.log(req.body);
  Users.findOne({ email: req.body.email.toLowerCase() })
    .then((user) => {
      console.log(user);
      bcrypt
        .compare(req.body.password, user.password)
        .then((passwordcheck) => {
          if (!passwordcheck) {
            return res.send("Passwords do not match!");
          }

          const token = jwt.sign(
            {
              data: user.email,
            },
            "secret",
            { expiresIn: "24h" }
          );
          console.log(token);
          return res.status(200).send({
            message: "Login Succesful",
            email: user.email,
            Name: user.Name,
            Field: user.Field,
            Username:user.Username,
            token,
          });
        })
        .catch((error) => {
          console.log(error);
          return res.send({
            message: "Some error occured",
            error,
          });
        });
    })
    .catch((error) => {
      console.log(error);
      return res.status(404).send({
        message: "Email not found",
        error,
      });
    });
});

// authentication endpoint
app.get("/auth-endpoint", auth, (request, response) => {
  response.json({ message: "You are  not authorized to access me" });
});

app.get("/noauth-endpoint",(request, response) => {
  response.json({ message: "You are authorized to access me" });
});



app.post("/question", auth, async (req, res) => {
  console.log(req.body);
  let question = new Questions({
    question: req.body.question,
    Field: req.body.Field,
    Username: req.body.Username,
    Date: new Date(),
  });
  question = question
    .save()
    .then((result) => {
      console.log(result);
      return res.status(201).json({
        message: "Question posted succesfully",
        question: result,
      });
    })
    .catch((error) => {
      console.log(error);
      return res.status(400).json({
        message: "Some error occured",
        error: error,
      });
    });
});

app.post("/getquestion", auth, async (req, res) => {

  Questions.find({ Field: req.body.Field })
    .then((response) => {
      return res.status(200).json({ message: response });
    })
    .catch((error) => {
      return res.status(400).json({ message: "Some error occured" });
    });
});

app.post("/getemail", (req, res) => {
  Users.find({
    $or: [{ email: req.body.email }, { Username: req.body.Username }],
  })
    .then((user) => {
      console.log(user);
    })
    .catch((error) => {
      console.log("Username not found", error);
    });
});

app.get('/getanswer/:id',(req,res) => {
  
})

app.post('/addanswer/:id',auth,(req,res) => {
  console.log('In add answer',req.body);
  Ans = {}
  Ans[req.body.answer] = req.body.Username
  let answer = new Answer({
    Username:req.body.Username,
    answer: req.body.answer
  })
  answer = answer.save();
  Questions.findByIdAndUpdate(req.params.id,
    {
      "$push":{"Answers":Ans}
    },{new:true}).then(response => {
      console.log(response);
      return res.send({message:'Answers updated',response})
    }).catch(error => {
      console.log(error);
      return res.status(400).send({message:error})
    })
})


app.post('/gettotalquestionsasked',auth,(req,res) => {
  Questions.countDocuments({Username:req.body.Username}).then(count => {
    return res.send({message:count})
  }).catch(error => {
    return res.status(400).send({message:error})
  })
})

app.post('/gettotalanswers',auth,(req,res) => {
  Answer.countDocuments({Username:req.body.Username}).then(count => {
    return res.send({message:count})
  }).catch(error => {
    return res.status(400).send({message:error})
  })
})