var Post 		= require('../models/post');
var User 		= require('../models/user');
var Comment 	= require('../models/comment');
var log         = require('../log')(module);
var async 		= require('async');
var _ 			= require('underscore');
var HttpStatus 	= require('http-status-codes');

exports.postPosts = function(req,res){
	var newPost = new Post();

	newPost.author = req.user.username;
	newPost.title = req.body.title;
	newPost.text = req.body.text;

	async.waterfall([
		function(callback){
			newPost.save(function(err,post){
				callback(err,post);
			});
		},
		function(post,callback){
			var author = String(post.author)
			User.findOne({'username':author},function(err,user){
				user.posts.push(post._id);
				user.save(function(err){
					callback(err,user,post);
				});
			});
		}
		],
		function(err,user,post){
			if (!err)
				log.info({message: " Created new post '" + post.title + "' by " + user.username + "!"});
			else
				res.send(err);
			res.status(HttpStatus.CREATED).json(post);
		}
	);
}

exports.getPosts = function(req,res){
	Post.find({}).sort("votes").lean().exec(function(err,posts){
		if (!err)
			log.info({message:" Got all posts!"});
		else
			res.send(err);
		res.status(HttpStatus.OK).json(posts);
	});
}

exports.deletePosts = function(req,res){
	async.parallel([
		function(callback){
			User.find({},function(err,users){
				async.forEach(users,
					function(user,done){
						user.posts = [];
						user.save(done);
					},
					function(err){
						callback(err,null)
					}
				);
			});
		},
		function(callback){
			Post.find({}).remove(function(err,posts){
				callback(err,posts);
			});
		}
		],
		function(err,result){
			if (!err)
				log.info({message:" Deleted all posts!"});
			else
				res.send(err);
			res.status(HttpStatus.NO_CONTENT).end();
		}
	);
}

exports.getPost = function(req,res){
	async.waterfall([
		function(callback){
			Post.findById(req.params.id).lean().exec(function(err,post){
				callback(err,post);
			});
		},
		function(post,callback){
			post.comment_bodies = [];
			async.forEach(post.comments,
				function(comment_id,done){
					Comment.findById(comment_id).lean().exec(function(err,comment){
						post.comment_bodies.push(comment);
						done();
					});
				},
				function(err){
					callback(err,post)
				}
			);
		}
		],
		function(err,post){
			if (!err)
				log.info({message:" Got post " + post.text + "!"});
			else
				res.send(err);
			res.status(HttpStatus.OK).json(post);
		});
/*	Post.findById(req.params.id).lean().exec(function(err,post){
		if (!err)
			log.info({message:" Got post " + post.text + "!"});
		else
			res.send(err);
		res.status(HttpStatus.OK).json(post);
	});*/
}

exports.patchPost = function(req,res){
	Post.findById(req.params.id,function(err,post){
		post.votes += Number(req.body.vote);
		post.save(function(err,post){
			if (!err)
				log.info({message:" Voted " + req.body.vote + " on post!"});
			else
				res.send(err);
			res.status(HttpStatus.MULTI_STATUS).json(post);
		});
	});
}

exports.deletePost = function(req,res){
	async.waterfall([
		function(callback){
			Post.findById(req.params.id).remove(function(err,post){
				callback(err,post);
			});
		},
		function(post,callback){
			User.findOne({'username':post.author},function(err,user){
				user.posts = _.without(user.posts,post._id);
				User.save(function(err){
					callback(err,post);
				});
			});
		}
		],
		function(err,post){
			if (!err)
				log.info({message:" Deleted post " + post.text + "!"});
			else
				res.send(err);
			res.status(HttpStatus.NO_CONTENT).end();
		}
	);
}

exports.getUserPosts = function(req,res){
	async.waterfall([
		function(callback){
			User.findById(req.params.user_id,function(err,user){
				callback(err,user.posts,user)
			});
		},
		function(post_ids,user,callback){
			Post.find({_id : {$in : post_ids}}).sort('-date').lean().exec(function(err,posts){
				callback(err,user,posts);
			});
		}
		],
		function(err,user,posts){
			if (!err)
				log.info({message: " Got all posts for user " + user.username + "!"});
			else
				res.send(err);
			res.status(HttpStatus.OK).json(posts);
		}
	);
}
exports.deleteUserPosts = function(req,res){
	async.waterfall([
		function(callback){
			User.findById(req.params.user_id,function(err,user){
				user.posts = [];
				user.save(function(err,user){
					callback(err,user.username)
				});
			});
		},
		function(username,callback){
			Post.find({author : username}).remove(function(err,posts){
				callback(err,username,posts);
			});
		}
		],
		function(err,username,posts){
			if (!err)
				log.info({message: " Deleted all posts for user " + username + "!"});
			else
				res.send(err);
			res.status(HttpStatus.NO_CONTENT).end();
		}
	);
}

exports.getPostComments = function(req,res){
	var order = "-" + String(req.query.sort)
	async.waterfall([
		function(callback){	
			Post.findById(req.params.id,function(err,post){
				callback(err,post);
			});
		},
		function(post,callback){
			Comment.find({_id : {$in : post.comments}}).sort(order).lean().exec(function(err,comments){
				callback(err,comments,post);
			});
		}
		],
		function(err,comments,post){
			if (!err)
				log.info({message: " Got all comments on post " + post.title + "!"});
			else
				res.send(err);
			res.status(HttpStatus.OK).json(comments);
		}
	);
}

function done(){
	log.info("done");
}