var mongoose = require('mongoose')
var bcrypt = require('bcrypt-nodejs')
var Schema = mongoose.Schema;

function validatePresenceOf(value) {
    return value && value.length;
}

var UserSchema = Schema({
  username: {
              type: String,
              required: true,
              unique: true,
              validate: [validatePresenceOf, 'username cannot be blank']
            },
  password: {
              type: String,
              required: true
            },
  posts: [Schema.ObjectId],
  comments: [Schema.ObjectId],
  secret: String
});

UserSchema.pre('save', function(callback) {
  var user = this;

  if (!user.isModified('password')) return callback();

  bcrypt.genSalt(5, function(err, salt) {
    if (err) return callback(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return callback(err);
      user.password = hash;
      callback();
    });
  });
});

UserSchema.methods.verifyPassword = function(password, cb) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

/*UserSchema.methods.makeSecret = function(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.!@#$%^&*()_+=;<>/?|";

    for( var i=0; i < 15; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}*/

module.exports = mongoose.model('User', UserSchema);
