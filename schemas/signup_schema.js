const mongoose = require("mongoose");
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const signup = {
  fname: { type: String },
  lname: { type: String },
  rollNo: { type: Number },
  uname: { type: String, required: true },
  email: { type: String },
  pswd1: { type: String, required: true },
  pswd2: { type: String },
  role: { type: String },
};

const SignUp = mongoose.model("SignUp", signup);
module.exports = SignUp;
