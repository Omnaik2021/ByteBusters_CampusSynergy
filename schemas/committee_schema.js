const mongoose = require("mongoose");
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const committee = {
  cname: { type: String, required: true },
  members: { type: [String], required: true },
  desc: { type: String, required: true },
  memCount: { type: Number },
  status: { type: String },
};

const Committee = mongoose.model("Committee", committee);
module.exports = Committee;
