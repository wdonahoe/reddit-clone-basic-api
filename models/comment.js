var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
  author: { type: String, required: true},
  text: String,
  date: { type: Date, default: Date.now },
  votes: {type: Number, default: 0},
  parentPost: {type: Schema.ObjectId, required: true }
});

module.exports = mongoose.model("Comment",CommentSchema);