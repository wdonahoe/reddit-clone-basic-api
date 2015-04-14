var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var PostSchema = new Schema({
  author: { type: String, required: true},
  title: {
    type: String,
    required: true
  },
  text: String,
  date: { type: Date, default: Date.now },
  votes: {type: Number, default: 0},
  comments:{
    type:[Schema.ObjectId],
    default: []
  }
});

module.exports = mongoose.model("Post",PostSchema);