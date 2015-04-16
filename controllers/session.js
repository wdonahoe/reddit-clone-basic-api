var User 		     = require('../models/user');
var jwt  		     = require('jsonwebtoken');
var config 		   = require('../config');
var _ 			     = require('underscore');
var HttpStatus   = require('http-status-codes');

function createToken(user) {
  return jwt.sign(_.omit(user, 'password'), config.secret, { expiresInMinutes: 60*5 });
}

exports.postSession = function(req,res){
  	if (!req.body.username || !req.body.password) {
    	return res.status(HttpStatus.BAD_REQUEST).send("You must send the username and the password");
  	}
  	User.findOne({username:req.body.username},function(err,user){
  		if (err)
  			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
  		if (!user) {
    		return res.status(HttpStatus.UNAUTHORIZED).send("Invalid username!");
 		}
		user.verifyPassword(req.body.password, function(err, isMatch){
			if (err)
				return res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
			if (!isMatch)
				return res.status(HttpStatus.UNAUTHORIZED).send("The username or password do not match!");
			res.status(HttpStatus.CREATED).send({
    			id_token: createToken(user),
    			user: _.omit(user,'password')
  			});
		});
  });
}

exports.deleteSession = function(req,res){
  var issuer = payload.iss;
  var tokenId = payload.jti;

  data.getRevokedToken(issuer, tokenId, function(err, token){
    if (err) { return done(err); }
    req.user = null;
    return done(null, !!token);
  });
}