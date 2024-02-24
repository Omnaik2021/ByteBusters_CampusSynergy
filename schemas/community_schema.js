const mongoose = require("mongoose");
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const community = {
  cname: { type: String, required: true },
  members: { type: [String], required: true },
};

const Community = mongoose.model("SignUp", community);
module.exports = Community;
