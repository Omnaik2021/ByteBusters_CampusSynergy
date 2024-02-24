const mongoose = require("mongoose");
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const notes = {
  name: String,
};

const Note = mongoose.model("Note", notes);
module.exports = Note;
