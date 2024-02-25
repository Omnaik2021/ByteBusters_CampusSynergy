const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
// const jwt = require("jsonwebtoken");
const path = require("path");
const nodemailer = require("nodemailer");
require("dotenv").config();

const Signup = require("./schemas/signup_schema.js");
const committee = require("./schemas/committee_schema.js");
const http = require("http");
const cookieParser = require("cookie-parser");

const { log } = require("console");
const Committee = require("./schemas/committee_schema.js");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "hbs");

const mg = mongoose.connect(process.env.MDB, { useNewUrlParser: true });
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

app.get("/test2", async (req, res) => {
  const luser2 = await Committee.find({ status: "pending" });
  console.log(luser2);
  // console.log(process.env.S3_BUCKET)
  // res.sendFile(__dirname + "/test2.html");
  // res.json(luser2);
  res.render("test2.hbs", { listy: luser2 });
});

app.get("/signup", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/test1.html", function (req, res) {
  res.sendFile(__dirname + "/test1.html");
});

// app.post("/", function (req, res) {
//   let newNote = new Note({
//     name: req.body.userInput,
//   });
//   newNote.save();
// });

app.post("/signup", function (req, res) {
  let newSignup = new Signup({
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
  res.redirect("/");
});

app.post("/", async (req, res) => {
  const uname = req.body.uname;
  const pswd = req.body.pswd;

  const luser = await Signup.findOne({ uname });
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
    // res.cookie("jwt", user_id);
    // const jwt.sign()
    console.log("usid :" + user_id);
    const decoded = req.cookies.jwt;
    console.log("Cookie:" + decoded);
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
        res.render("Homepage.hbs", { isLogin: true });
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

app.get("/committee", function (req, res) {
  res.sendFile(__dirname + "/Committee.html");
});

app.post("/committee", function (req, res) {
  var memberCount = req.body.custId;
  console.log(memberCount);
  var all_members = new Array(memberCount);
  for (var i = 1; i <= memberCount; i++) {
    // Access each member by name (mem1, mem2, mem3, etc.)
    let it = "mem" + i;
    // console.log("data " + req.body[it]);
    all_members[i - 1] = req.body[it];
  }
  let newCommittee = new committee({
    cname: req.body.cname,
    members: all_members,
    desc: req.body.desc,
    memCount: memberCount,
    status: "pending",
  });
  console.log(newCommittee);
  newCommittee.save();
});

function createRandomString() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function createUser() {
  const chars = "0123456789";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

app.get("/admin_accept", async (req, res) => {
  const id = req.query.data1;
  const post_id = { _id: id };
  const emailq = await Committee.findOne({ _id: id });
  console.log("here: " + emailq.members);
  const updateDoc = { $set: { status: "accepted" } };
  const result = await Committee.updateOne(post_id, updateDoc);

  // console.log(process.env.USER);
  // console.log(process.env.PASS);
  const transporter = nodemailer.createTransport({
    port: 465, // true for 465, false for other ports
    host: "smtp.gmail.com",
    auth: {
      user: process.env.USER,

      pass: process.env.PASS,
    },
    secure: true,
  });
  let gen_pass = createRandomString();
  let gen_user = createUser();
  gen_user = emailq.cname + gen_user;
  console.log("gen pass " + gen_pass + " gen user " + gen_user);
  const mailData = {
    from: process.env.USER, // sender address
    to: emailq.members, // list of receivers
    subject: "Your Request for forming a committee has been Accepted",
    text: process.env.TEXT,
    html:
      "<b>Hey there! </b> <br> Your Request for forming a committee has been accepted by the Admin<br/> Use the below credentials to Login<br> Username: " +
      gen_user +
      "<br> Password: " +
      gen_pass,
  };

  // An array of attachments
  //   attachments: [
  //     {
  //         filename: 'text notes.txt',
  //         path: 'notes.txt
  //     },
  //  ]

  transporter.sendMail(mailData, function (err, info) {
    if (err) console.log(err);
    else console.log(info);
  });
  let newSignup = new Signup({
    uname: gen_user,
    pswd1: gen_pass,
    role: "committee",
  });
  newSignup.save();
  res.redirect("/test2");
});

app.get("/admin_reject", async (req, res) => {
  const id = req.query.data1;
  const post_id = { _id: id };
  const emailq = await Committee.findOne({ _id: id });
  console.log("here: " + emailq.members);
  const updateDoc = { $set: { status: "rejected" } };
  const result = await Committee.updateOne(post_id, updateDoc);

  const transporter = nodemailer.createTransport({
    port: 465, // true for 465, false for other ports
    host: "smtp.gmail.com",
    auth: {
      user: process.env.USER,

      pass: process.env.PASS,
    },
    secure: true,
  });

  const mailData = {
    from: process.env.USER, // sender address
    to: emailq.members, // list of receivers
    subject: "Your Request for forming a committee has been Rejected",
    text: process.env.TEXT,
    html: "<b>Hey there! </b> <br>Sorry to inform your Request for forming a committee has been <b>Rejected</b> by the Admin<br/> Rejection Reason: Dummy",
  };

  transporter.sendMail(mailData, function (err, info) {
    if (err) console.log(err);
    else console.log(info);
  });
});

app.get("/home", function (req, res) {
  res.render("Homepage.hbs", {});
});

app.listen(3000, function () {
  console.log("server is running on 3000");
});
