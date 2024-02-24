const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(
  "mongodb+srv://kristen:kris@cluster0.yt2jjtk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  { useNewUrlParser: true }
);
// mongoose.connection.on("connected", () => {
//   console.log("Database connected successfully");
// });
// mongoose.connection.on("error", (error) => {
//   console.log("Error while connecting with the database ", error.message);
// });

// const Note = mongoose;
const notes = {
  name: String,
};

const Note = mongoose.model("Note", notes);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/test1.html");
});

app.post("/", function (req, res) {
  let newNote = new Note({
    name: req.body.userInput,
  });
  newNote.save();
});

app.listen(3000, function () {
  console.log("server is running on 3000");
});
