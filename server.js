const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
// impoconrt Note from "schema.js";
const signup = require("./schemas/signup_schema.js");
const SignUp = require("./schemas/signup_schema.js");
const http = require("http");
const cookie = require("cookie");
const { log } = require("console");

app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(
  "mongodb+srv://kristen:kris@cluster0.yt2jjtk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  { useNewUrlParser: true }
);
// app.use(express.static(__dirname + "/assets"));
// app.use(express.static(__dirname + "/CSS Styling"));
app.use("/assets", express.static(path.join(__dirname, "/assets")));
app.use("/CSS", express.static(path.join(__dirname, "/CSS")));
// mongoose.connection.on("connected", () => {
//   console.log("Database connected successfully");
// });
// mongoose.connection.on("error", (error) => {
//   console.log("Error while connecting with the database ", error.message);
// });

// const Note = mongoose;

// const notes = {
//   name: String,
// };

// const Note = mongoose.model("Note", notes);
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/Login.html");
});

app.get("/signup", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

// app.post("/", function (req, res) {
//   let newNote = new Note({
//     name: req.body.userInput,
//   });
//   newNote.save();
// });

app.post("/signup", function (req, res) {
  let newSignup = new signup({
    fname: req.body.fname,
    lname: req.body.lname,
    rollNo: req.body.rollno,
    uname: req.body.uname,
    email: req.body.email,
    pswd1: req.body.pswd1,
    pswd2: req.body.pswd2,
    role: "student",
  });
  newSignup.save();
});

app.post("/", async (req, res) => {
  const uname = req.body.uname;
  const pswd = req.body.pswd;

  const luser = await SignUp.findOne({ uname });
  const user_id = luser._id;
  let isMatch = false;
  console.log(pswd + "  " + luser.pswd1);
  if (pswd === luser.pswd1) {
    isMatch = true;
  } else {
    isMatch = false;
  }
  try {
    res.cookie("jwt", user_id, {
      expires: new Date(Date.now() + 1800000),
      httpOnly: true,
    });
    console.log(req.cookies);
  } catch (e) {
    console.log(e);
  }
  console.log("Cookies getting log");

  if (luser) {
    if (isMatch) {
      const user = {
        fname: luser.fname,
        uname: luser.uname,
        email: luser.email,
      };
      // req.session.user = user;
      // req.session.save(session.user);

      if (luser.role === "student") {
        // res.render("admin", {user} );
        res.redirect("http://localhost:3000/test1.html");
        console.log("student login succesfull");
      } else {
        res.redirect("test2.html");
        console.log("Committee login succesfull");
      }
    } else {
      res.send("Invalid Credentials");
    }
  } else {
    res.send("Invalid Credentials");
  }
});

app.listen(3000, function () {
  console.log("server is running on 3000");
});
