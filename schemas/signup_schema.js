const mongoose = require("mongoose");
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const signup = {
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  rollNo: { type: Number, required: true },
  uname: { type: String, required: true },
  email: { type: String, required: true },
  pswd1: { type: String, required: true },
  pswd2: { type: String, required: true },
  role: { type: String, required: true },
};

const SignUp = mongoose.model("SignUp", signup);
module.exports = SignUp;
