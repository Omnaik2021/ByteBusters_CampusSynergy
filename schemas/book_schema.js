const mongoose = require("mongoose");
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const book = {
  date: { type: Date },
  sesh: { type: String },
  r1:{ type: String },
  r2:{ type: String },
  r3:{ type: String },
  r4:{ type: String },
  r5:{ type: String },
  r6:{ type: String },
  
 
};

const Book = mongoose.model("Book", book);
module.exports = Book;
