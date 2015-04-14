var Comment 	= require('../models/comment');
var User 		= require('../models/user');
var Post 		= require('../models/post');
var log         = require('../log')(module);
var async 		= require('async');
var _ 			= require('underscore');
var HttpStatus 	= require('http-status-codes');

exports.postComments = function(req,res){
	var newComment = new Comment({
		author: req.user.username,
		text: req.body.text,
		parentPost: req.body.parentPost
	});
	async.waterfall([
		function(callback){
			newComment.save(function(err,comment){
				callback(err,comment);
			});
		},
		function(comment,callback){
			User.findOne({username:comment.author},function(err,user){
				user.comments.push(comment._id);
				user.save(function(err,user){
					callback(err,user,comment);
				});
			});
		},
		function(user,comment,callback){
			Post.findById(comment.parentPost,function(err,post){
				post.comments.push(comment._id);
				post.save(function(err,post){
					callback(err,user,comment,post);
				});
			});
		}
		],
		function(err,user,comment,post){
			if (!err)
				log.info({message: " Created new comment '" + post.text + "' by " + user.username + " on " + post.title + "!"});
			else
				res.send(err);
			res.status(HttpStatus.CREATED).json(comment);
		}
	);
}

exports.getComments = function(req,res){
	Comment.find({},function(err,comments){
		if (!err)
			log.info({message:" Got all comments!"});
		else
			res.send(err);
		res.status(HttpStatus.OK).json(comments);
	});
}

exports.deleteComments = function(req,res){
	async.parallel([
		function(callback){
			User.find({},function(err,users){
				async.forEach(users,
					function(user,done){
						user.comments = [];
						user.save(done);
					},
					function(err){
						callback(err,null)
					}
				);
			});
		},
		function(callback){
			Comment.find({}).remove(function(err,comments){
				callback(err,comments);
			});
		}
		],
		function(err,result){
			if (!err)
				log.info({message:" Deleted all comments!"});
			else
				res.send(err);
			res.status(HttpStatus.NO_CONTENT).send(result[1]);
		}
	);
}

exports.getComment = function(req,res){
	Comment.findById(req.params.id,function(err,comment){
		if (!err)
			log.info({message:" Got comment " + comment.text + "!"});
		else
			res.send(err);
		res.status(HttpStatus.OK).json(comment);
	});
}

exports.patchComment = function(req,res){
	Comment.findById(req.params.id,function(err,comment){
		comment.votes += Number(req.body.vote);
		comment.save(function(err,comment){
			if (!err)
				log.info({message:" Voted " + req.body.vote + " on comment!"});
			else
				res.send(err);
			res.status(HttpStatus.MULTI_STATUS).json(comment);
		});
	});
}

exports.deleteComment = function(req,res){
	async.waterfall([
		function(callback){
			Comment.findById(req.params.id).remove(function(err,comment){
				callback(err,comment);
			});
		},
		function(comment,callback){
			User.findOne({'username':comment.author},function(err,user){
				user.comments = _.without(user.comments,comment._id);
				User.save(function(err){
					callback(err,comment);
				});
			});
		}
		],
		function(err,comment){
			if (!err)
				log.info({message:" Deleted comment " + comment.text + "!"});
			else
				res.send(err);
			res.status(HttpStatus.NO_CONTENT).send(comment);
		}
	);
}

exports.getUserComments = function(req,res){
	async.waterfall([
		function(callback){
			User.findById(req.params.user_id,function(err,user){
				callback(err,user.comments,user)
			});
		},
		function(comment_ids,user,callback){
			Comment.find({_id : {$in : comment_ids}}).sort('-date').exec(function(err,comments){
				callback(err,user,comments);
			});
		}
		],
		function(err,user,comments){
			if (!err)
				log.info({message: " Got all comments for user " + user.username + "!"});
			else
				res.send(err);
			res.status(HttpStatus.OK).json(comments);
		}
	);
}

exports.deleteUserComments = function(req,res){
	async.waterfall([
		function(callback){
			User.findById(req.params.user_id,function(err,user){
				user.comments = [];
				user.save(function(err,user){
					callback(err,user.username)
				});
			});
		},
		function(username,callback){
			Comment.find({author : username}).remove(function(err,comments){
				callback(err,username,comments);
			});
		}
		],
		function(err,username,comments){
			if (!err)
				log.info({message: " Deleted all comments for user " + username + "!"});
			else
				res.send(err);
			res.status(HttpStatus.NO_CONTENT).send(comments);
		}
	);
}

function done(){
	log.info("done");
}