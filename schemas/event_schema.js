const mongoose = require("mongoose");
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const event = {
  ename: { type: String },
  edesc: { type: String },
  edate: { type: Date },
  sesh: { type: String },
  nop: { type: String },
  room_req: { type: String },
  fmentor: { type: String },
  dean: { type: String },
  hod: { type: String },
  princi: { type: String },
};

const Event = mongoose.model("Event", event);
module.exports = Event;
