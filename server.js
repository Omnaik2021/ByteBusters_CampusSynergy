const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const path = require("path");

const Signup = require("./schemas/signup_schema.js");
const committee = require("./schemas/committee_schema.js");
const http = require("http");
const cookieParser = require("cookie-parser");

const { log } = require("console");
const Committee = require("./schemas/committee_schema.js");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine","hbs")

const mg = mongoose.connect(
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

app.get("/test2", async (req, res) => {

const luser2 = await Committee.find({});
console.log(luser2);
// res.sendFile(__dirname + "/test2.html");
// res.json(luser2);
res.render("test2.hbs", {listy:luser2} )
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
    count: memberCount,
    status:"pending",
  });
  console.log(newCommittee);
  newCommittee.save();
});

app.get("/admin_accept", async(req, res)=> {
  const id = req.query.data1;
  const post_id = { _id: id};
  const updateDoc = { $set: {status: "accepted" } };
  const result = await Committee.updateOne(post_id, updateDoc)
})


app.get("/admin_reject", async(req, res)=> {
  const id = req.query.data1;
  const post_id = { _id: id};
  const updateDoc = { $set: {status: "rejected" } };
  const result = await Committee.updateOne(post_id, updateDoc)
})

















app.listen(3000, function () {
  console.log("server is running on 3000");
});
