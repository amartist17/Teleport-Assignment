const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A blog should have a title"],
  },
  content: {
    type: String,
    required: [true, "A blog should have some content"],
  },
  date: {
    type: Date,
    default: new Date(),
  },
});

module.exports = mongoose.model("Blog", blogSchema);
