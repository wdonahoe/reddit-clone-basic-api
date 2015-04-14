var User 			= require('../models/user');
var jwt  			= require('jsonwebtoken');
var config 			= require('../config');
var HttpStatus 		= require('http-status-codes');
var _ 				= require('underscore');
var log             = require('../log')(module);

function createToken(user) {
  return jwt.sign(_.omit(user, 'password'), config.secret, { expiresInMinutes: 1 });
}

exports.postUsers = function(req,res){
	var newUser = new User({
		username: req.body.username,
		password: req.body.password
	});

	newUser.save(function(err,user){
		if (!err)
			log.info({message: " User " + user.username + " created!"})
		else 
			res.send(err);

		res.status(HttpStatus.CREATED).send({
    		id_token: createToken(user),
    		user: _.omit(user,'password')
  		});
	});
}

exports.getUsers = function(req,res){
	User.find({},'-password').lean().exec(function(err, users){
		if (!err)
			log.info({message: " Got users!"});
		else
			res.send(err);
		res.status(HttpStatus.OK).json(users);
	});
}


exports.getUser = function(req,res){
	User.findById(req.params.id,'-password').lean().exec(function(err,user){
		if (!err)
			log.info({message: " Got user " + user.username + "!"});
		else
			res.send(err);
		res.status(HttpStatus.OK).json(user);
	});
}

exports.patchUser = function(req,res){
	if (req.params.id != req.user._id){
		res.status(HttpStatus.UNAUTHORIZED).end();
	}
	User.findById(req.params.id,function(err,user){
		if (!err){
			user.password = req.body.password;
			user.save(function(err,user){
				if (!err)
					log.info({message: " Updated user " + user.username + "!"});
				else
					res.send(err);
				res.status(HttpStatus.MULTI_STATUS).json(user);
			});
		} else {
			res.send(err);
		}
	});
}

exports.deleteUser = function(req,res){
	if (req.params.id != req.user._id){
		res.status(HttpStatus.UNAUTHORIZED).end();
	}
	User.findById(req.params.id).remove(function(err){
		if (!err)
			log.info({message: " User " + user.username + " deleted!"});
		else
			res.send(err);
		res.status(HttpStatus.NO_CONTENT).end();
	});
}