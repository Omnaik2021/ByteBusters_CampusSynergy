const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
// const jwt = require("jsonwebtoken");
const path = require("path");
const nodemailer = require("nodemailer");
const session = require("express-session");
require("dotenv").config();

const Signup = require("./schemas/signup_schema.js");
const committee = require("./schemas/committee_schema.js");
const http = require("http");
const cookieParser = require("cookie-parser");

const { log } = require("console");
const Committee = require("./schemas/committee_schema.js");
const Event = require("./schemas/event_schema.js");
const Book = require("./schemas/book_schema.js");
const SignUp = require("./schemas/signup_schema.js");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "hbs");

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

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

app.get("/Admin", async (req, res) => {
  const luser2 = await Committee.find({ status: "pending" });
  console.log(luser2);
  // console.log(process.env.S3_BUCKET)
  // res.sendFile(__dirname + "/test2.html");
  // res.json(luser2);
  res.render("Admin.hbs", { listy: luser2 });
});

app.get("/fmentor", async (req, res) => {
  const luser2 = await Event.find({ fmentor: "pending" });
  console.log(luser2);
  // console.log(process.env.S3_BUCKET)
  // res.sendFile(__dirname + "/test2.html");
  // res.json(luser2);
  res.render("fmentor.hbs", { listy: luser2 });
});

app.get("/hod", async (req, res) => {
  const luser2 = await Event.find({
    $and: [{ fmentor: "approved" }, { dean: "approved" }, { hod: "pending" }],
  });
  console.log(luser2);
  // console.log(process.env.S3_BUCKET)
  // res.sendFile(__dirname + "/test2.html");
  // res.json(luser2);
  res.render("hod.hbs", { listy: luser2 });
});

app.get("/dean", async (req, res) => {
  const luser2 = await Event.find({
    $and: [{ fmentor: "approved" }, { dean: "pending" }],
  });
  console.log(luser2);
  // console.log(process.env.S3_BUCKET)
  // res.sendFile(__dirname + "/test2.html");
  // res.json(luser2);
  res.render("dean.hbs", { listy: luser2 });
});

app.get("/princi", async (req, res) => {
  const luser2 = await Event.find({
    $and: [
      { fmentor: "approved" },
      { dean: "approved" },
      { hod: "approved" },
      { princi: "pending" },
    ],
  });
  console.log(luser2);
  // console.log(process.env.S3_BUCKET)
  // res.sendFile(__dirname + "/test2.html");
  // res.json(luser2);
  res.render("princi.hbs", { listy: luser2 });
});

app.get("/Admin_history", async (req, res) => {
  const luser2 = await Committee.find();
  console.log(luser2);
  // console.log(process.env.S3_BUCKET)
  // res.sendFile(__dirname + "/test2.html");
  // res.json(luser2);
  res.render("Admin_history.hbs", { listy: luser2 });
});

app.get("/signup", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/test1.html", function (req, res) {
  res.sendFile(__dirname + "/test1.html");
});

app.get("/event", function (req, res) {
  res.render("event-form.hbs");
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
  req.session.isLogin = false;
  const uname = req.body.uname;
  const pswd = req.body.pswd;
  try {
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
          req.session.isLogin = true;
          res.render("Homepage.hbs", { isLogin: true });
          console.log("student login succesfull");
        } else if (luser.role === "admin") {
          res.redirect("/Admin");
          console.log("admin login succesfull");
        } else if (luser.role === "fmentor") {
          res.redirect("/fmentor");
          console.log("fmentor login succesfull");
        } else if (luser.role === "hod") {
          res.redirect("/hod");
          console.log("hod login succesfull");
        } else if (luser.role === "dean") {
          res.redirect("/dean");
          console.log("dean login succesfull");
        } else if (luser.role === "princi") {
          res.redirect("/princi");
          console.log("princi login succesfull");
        } else {
          res.send(
            "Committee login succesfull <br>Committee pages currently in development ......."
          );
          console.log("Committee login succesfull");
        }
      } else {
        res.send("Invalid Credentials");
      }
    } else {
      res.send("Invalid Credentials");
    }
  } catch (e) {
    res.send("Invalid Credentials");
    return;
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

app.get("/fmentor_accept", async (req, res) => {
  const id = req.query.data1;
  const post_id = { _id: id };
  // const emailq = await Event.findOne({ _id: id });
  // console.log("here: " + emailq.members);
  console.log("sigme forvever" + post_id._id);
  const updateDoc = { $set: { fmentor: "approved" } };
  const result = await Event.updateOne(post_id, updateDoc);
  res.redirect("/fmentor");
  console.log(result);
});

app.get("/fmentor_reject", async (req, res) => {
  const id = req.query.data1;
  const post_id = { _id: id };
  const emailq = await Event.findOne({ _id: id });
  // console.log("here: " + emailq.members);
  const updateDoc = { $set: { fmentor: "rejected" } };
  const result = await Event.updateOne(post_id, updateDoc);
  res.redirect("/fmentor");
});

app.get("/dean_accept", async (req, res) => {
  const id = req.query.data1;
  const post_id = { _id: id };
  // const emailq = await Event.findOne({ _id: id });
  // console.log("here: " + emailq.members);
  console.log("sigme forvever" + post_id._id);
  const updateDoc = { $set: { dean: "approved" } };
  const result = await Event.updateOne(post_id, updateDoc);
  res.redirect("/dean");
  console.log(result);
});

app.get("/dean_reject", async (req, res) => {
  const id = req.query.data1;
  const post_id = { _id: id };
  const emailq = await Event.findOne({ _id: id });
  // console.log("here: " + emailq.members);
  const updateDoc = { $set: { dean: "rejected" } };
  const result = await Event.updateOne(post_id, updateDoc);
  res.redirect("/dean");
});

app.get("/hod_accept", async (req, res) => {
  const id = req.query.data1;
  const post_id = { _id: id };
  // const emailq = await Event.findOne({ _id: id });
  // console.log("here: " + emailq.members);
  console.log("sigme forvever" + post_id._id);
  const updateDoc = { $set: { hod: "approved" } };
  const result = await Event.updateOne(post_id, updateDoc);
  res.redirect("/hod");
  console.log(result);
});

app.get("/hod_reject", async (req, res) => {
  const id = req.query.data1;
  const post_id = { _id: id };
  const emailq = await Event.findOne({ _id: id });
  // console.log("here: " + emailq.members);
  const updateDoc = { $set: { hod: "rejected" } };
  const result = await Event.updateOne(post_id, updateDoc);
  res.redirect("/hod");
});

app.get("/princi_accept", async (req, res) => {
  const id = req.query.data1;
  const post_id = { _id: id };
  // const emailq = await Event.findOne({ _id: id });
  // console.log("here: " + emailq.members);
  console.log("sigme forvever" + post_id._id);
  const updateDoc = { $set: { princi: "approved" } };
  const result = await Event.updateOne(post_id, updateDoc);
  res.redirect("/princi");
  console.log(result);
});

app.get("/princi_reject", async (req, res) => {
  const id = req.query.data1;
  const post_id = { _id: id };
  const emailq = await Event.findOne({ _id: id });
  // console.log("here: " + emailq.members);
  const updateDoc = { $set: { princi: "rejected" } };
  const result = await Event.updateOne(post_id, updateDoc);
  res.redirect("/princi");
});

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
  res.redirect("/Admin");
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
  res.render("/Admin");
});

app.get("/home", function (req, res) {
  res.render("Homepage.hbs", { isLogin: req.session.isLogin });
});

app.post("/event", async (req, res) => {
  if (!req.body.venue) {
    edate1 = req.body.edate;
    sesh1 = req.body.sesh;
    ename1 = req.body.ename;
    edesc1 = req.body.edesc;
    nop1 = req.body.nop;
  }

  venue = req.body.venue;

  // let newEvent = new Event({
  //   ename:req.body.ename,
  //   edesc:req.body.edesc,
  //   edate:req.body.edate,
  //   sesh: req.body.sesh,
  //   nop:req.body.nop,
  //   room_req:"nothing"
  // });
  // const savedEvent = await newEvent.save();
  // let eid =savedEvent._id;
  // const eid2 = { _id: eid };
  // const eid = objectIdString.toString();
  // console.log(eid2);
  if (venue) {
    // sadadsadasd
    venue = req.body.venue;
    console.log(venue);

    // console.log(room);
    // console.log(eid2);
    // const result = await Committee.updateOne(post_id, updateDoc);
    const isPresent = await Book.findOne({
      $and: [{ date: edate1 }, { sesh: sesh1 }],
    });
    console.log("isprevs " + isPresent);
    const post_id = { id: isPresent._id };
    const room = "r" + venue.charAt(9);
    console.log(room);
    const updateDoc = { $set: { [room]: "unavailable" } };

    const result = await Book.updateOne({ _id: isPresent._id }, updateDoc);
    console.log(result);
    let newEvent = new Event({
      ename: ename1,
      edesc: edesc1,
      edate: edate1,
      sesh: sesh1,
      nop: nop1,
      room_req: room,
      fmentor: "pending",
      dean: "pending",
      hod: "pending",
      princi: "pending",
    });
    newEvent.save();
    res.send(
      "Your Requested has been submitted.<a href='/home'>Click here to go to home page</a>"
    );
  } else {
    const isPresent = await Book.findOne({
      $and: [{ date: edate1 }, { sesh: sesh1 }],
    });
    if (isPresent) {
      console.log(isPresent);
      let avRooms = new Array(6);
      avRooms[(0, 0, 0, 0, 0, 0)];
      for (i = 1; i <= 6; i++) {
        if (isPresent["r" + i] == "available") {
          avRooms[i - 1] = "ROOM NO: " + i;
        }
      }
      // res.redirect("/venue",{data2: avRooms})
      res.render("venue.hbs", { data2: avRooms });
      // req.session.data = 2;
      // res.redirect("/sample")
    } else {
      console.log("Not found");

      let newBook = new Book({
        date: edate1,
        sesh: sesh1,
        r1: "available",
        r2: "available",
        r3: "available",
        r4: "available",
        r5: "available",
        r6: "available",
      });

      await newBook.save();
      const isPresent = await Book.findOne({
        $and: [{ date: edate1 }, { sesh: sesh1 }],
      });
      if (isPresent) {
        console.log(isPresent);
        let avRooms = new Array(6);
        avRooms[(0, 0, 0, 0, 0, 0)];
        for (i = 1; i <= 6; i++) {
          if (isPresent["r" + i] == "available") {
            avRooms[i - 1] = "ROOM NO: " + i;
          }
        }
        // res.redirect("/venue",{data2: avRooms})
        res.render("venue.hbs", { data2: avRooms });
        // req.session.data = 2;
        // res.redirect("/sample")
      }
    }
  }
});

app.get("/venue", function (req, res) {
  res.render("venue.hbs", { data2: avRooms });
});

app.post("/venue", async (req, res) => {
  let room = req.body.venue;
  console.log(room);
});

app.get("/sample", function (req, res) {
  data = req.session.data;
  console.log(data);
});

app.get("/event_list", async (req, res) => {
  const luser2 = await Event.find({
    $and: [
      { fmentor: "approved" },
      { dean: "approved" },
      { hod: "approved" },
      { princi: "approved" },
    ],
  });
  res.render("event-list.hbs", { listy: luser2, isLogin: req.session.isLogin });
});

app.get("/event_register", async (req, res) => {
  const eventid = req.query.data1;
  const isLogin = req.session.isLogin;
  if (isLogin === true) {
    const user_id = { _id: req.cookies.jwt };
    console.log(user_id);
    const update_doc = { $push: { reg_events: eventid } };
    const result = await SignUp.updateOne(user_id, update_doc);
    res.send(
      "You have been added to the event <a href='/home'>Click here to go to home page</a>"
    );
  } else {
    res.redirect("/");
  }
  console.log(isLogin);
});

app.get("/r_events", async (req, res) => {
  const user_id = { _id: req.cookies.jwt };
  const luser2 = await Signup.find({ _id: user_id });
  const event_ids = luser2.flatMap((item) => item.reg_events);
  // console.log(event_ids.len);
  console.log("All reg_events:", event_ids);
  const allevents = await Event.find({
    _id: { $in: event_ids },
  });
  // console.log(luser2[0][reg_events][0]);
  // const allevents = new Array(event_ids.length);
  // console.log("len " + event_ids.len);
  // for (var i = 0; i < event_ids.len; i++) {
  //   allevents[i] = await Event.find({ _id: { _id: allevents[i] } });
  //   console.log(allevents[i]);
  // }
  // console.log(allevents);
  res.render("r_eventlist.hbs", {
    listy: allevents,
    isLogin: req.session.isLogin,
  });
});

app.get("/logout", function (req, res) {
  req.session.isLogin = false;
  res.clearCookie("jwt");
  res.redirect("/");
});

app.listen(3000, function () {
  console.log("server is running on 3000");
});
