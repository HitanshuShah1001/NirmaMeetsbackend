const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("./auth");
require("dotenv").config();
const mongoose = require("mongoose");
const Users = require("./DB/Models/Users.js");
const Questions = require("./DB/Models/Questions.js");
const Answer = require("./DB/Models/Answers");
const OTP = require("./DB/Models/OTP");
const multer = require("multer");
const generateId = require("./Randomid");
const mail = require("./Sendemail");
const { db } = require("./DB/Models/Users.js");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

var date = new Date();

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Invalid image type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/profilephotos");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadoptions = multer({ storage: storage });

app.use(morgan("tiny"));
app.use(bodyParser.json());
app.use(express.static("public"));

app.use("/public", express.static("public"));

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
  .connect(process.env.DB, {
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

app.post("/register", uploadoptions.single("Profilephoto"), (req, res) => {
  Users.find({ email: req.body.email.toLowerCase() }).then((user) => {
    if (user[0] !== undefined) {
      res.send({ message: "Email already registered!" });
    } else {
      Users.find({ Username: req.body.Username }).then((user) => {
        if (user[0] !== undefined) {
          res.send({ message: "Username already exists" });
        } else {
          bcrypt
            .hash(req.body.password, 10)
            .then((hashedPassword) => {
              const fileName = req.file.filename;
              const basePath = `${req.protocol}://${req.get(
                "host"
              )}/public/profilephotos/`;
              const user = new Users({
                Name: req.body.Name,
                Username: req.body.Username,
                email: req.body.email.toLowerCase(),
                password: hashedPassword,
                Profilephoto: `${basePath}${fileName}`,
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
                  console.log(error);
                  res.status(500).send({
                    message: "Some error occured",
                    error,
                  });
                });
            })
            .catch((error) => {
              console.log(error);
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
  Users.findOne({ email: req.body.email.toLowerCase() })
    .then((user) => {
      console.log(user, "userrrr");
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
          return res.status(200).send({
            message: "Login Succesful",
            email: user.email,
            Name: user.Name,
            Field: user.Field,
            Username: user.Username,
            Profilephoto: user.Profilephoto,
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

app.get("/noauth-endpoint", (request, response) => {
  response.json({ message: "You are authorized to access me" });
});

app.post("/question", auth, async (req, res) => {
  let question = new Questions({
    question: req.body.question,
    Field: req.body.Field,
    Username: req.body.Username,
    Date: new Date(),
  });
  question = question
    .save()
    .then((result) => {
      return res.status(201).json({
        message: "Question posted succesfully",
        question: result,
      });
    })
    .catch((error) => {
      return res.status(400).json({
        message: "Some error occured",
        error: error,
      });
    });
});

app.post("/getquestion", auth, async (req, res) => {
  Questions.aggregate().addFields({"length":{"$size":'$Answers'}}).sort({"length":-1}).limit(5)
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

app.get("/getanswer/:id", (req, res) => {});

app.post("/addanswer/:id", auth, (req, res) => {
  let randomid = generateId(26, "123456789abcdefghi");
  Ans = {};
  Ans[req.body.answer] = req.body.Username;
  Ans["Votes"] = 0;
  Ans["id"] = randomid;

  let answer = new Answer({
    Username: req.body.Username,
    answer: req.body.answer,
  });
  answer = answer.save();
  Questions.findByIdAndUpdate(
    req.params.id,
    {
      $push: { Answers: Ans },
    },
    { new: true }
  )
    .then((response) => {
      return res.send({ message: "Answers updated", response });
    })
    .catch((error) => {
      return res.status(400).send({ message: error });
    });
});

app.post('/deleteanswer/:id',auth,(req,res) => {
  Questions.updateOne({_id:req.params.id},{"$pull": { "Answers" : { "id": req.body.id }}},{safe:true,multi:true}).then(response => {
    return res.status(200).send({message:"Answer deleted succesfully"})
  }).catch(error => {
    return res.status(400).send({message:error})
  })
});

app.post("/gettotalquestionsasked", auth, (req, res) => {
  Questions.countDocuments({ Username: req.body.Username })
    .then((count) => {
      return res.send({ message: count });
    })
    .catch((error) => {
      return res.status(400).send({ message: error });
    });
});

app.post("/gettotalanswers", auth, (req, res) => {
  Answer.countDocuments({ Username: req.body.Username })
    .then((count) => {
      return res.send({ message: count });
    })
    .catch((error) => {
      return res.status(400).send({ message: error });
    });
});

app.post("/addupvote/:id", auth, (req, res) => {
  Questions.findOneAndUpdate(
    { _id: req.params.id, "Answers.id": req.body.id },
    { $inc: { "Answers.$.Votes": 1 } }
  )
    .then((response) => {
      return res.status(200).send(response);
    })
    .catch((error) => {
      return res.status(400).send({ message: "Some error occured", error });
    });
});

app.post("/adddownvote/:id", auth, (req, res) => {
  Questions.findOneAndUpdate(
    { _id: req.params.id, "Answers.id": req.body.id },
    { $inc: { "Answers.$.Votes": -1 } }
  )
    .then((response) => {
      return res.send(response);
    })
    .catch((error) => {
      return res.status(400).send({ message: "Some error occured", error });
    });
});

app.post("/checkemail", async (req, res) => {
  const user = await Users.findOne({ email: req.body.email.toLowerCase() });
  if (!user) {
    return res
      .status(400)
      .send({ message: "Please enter a valid email address" });
  }
  console.log(user, "Before");
  return res.status(201).send({ message: "Email found", user });
});

app.post("/sendemail", async (req, res) => {
  const user = await Users.findOne({ email: req.body.email.toLowerCase() });
  if (user) {
    let code = Math.floor(Math.random() * 10000 + 1);
    let otp = new OTP({
      email: req.body.email.toLowerCase(),
      code,
      expiresIn: date.getTime() + 3600 * 1000,
    });
    let otpresponse = await otp.save();
    if (otpresponse) {
      mail(req.body.email, code);
      return res
        .status(200)
        .json({
          message: `An email with otp has been sent to ${req.body.email}`,
        });
    }
  } else {
    return res.status(400).send("Email Id does not exist!");
  }
});

app.post("/verifyotp", async (req, res) => {
  console.log(req.body.email.toLowerCase(),req.body.otpcode);
  let data = await OTP.findOne({ email: req.body.email.toLowerCase(), code: req.body.otpcode });
  console.log(data);
  if (data) {
    console.log(data);
    let currentTime = date.getTime();
    let diff = (data.expiresIn = currentTime);
    if (diff < 0) {
      return res
        .status(400)
        .send("Code has expired! Please request another one");
    } else {
      return res.status(200).send("OTP Verification successful!");
    }
  } else {
    console.log('Invalied');
    return res.status(400).send("Invalid OTP");
  }
});

app.post("/changepassword", async (req, res) => {
  console.log(req.body);
  let newpassword = await bcrypt.hash(req.body.password, 10);
  let user = await Users.findOneAndUpdate(
    {email:req.body.email},
    { password: newpassword },
    { new: true })

    console.log(user);
  // ).then((resp) => {
  //   console.log(resp);
  //   res.status(200).send({message:'Password updated succesfully'})
  // }).catch(error => {
  //   console.log(error);
  //   res.status(400).send(error);
  // })
});
