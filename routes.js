var express = require('express');
var router = express.Router();
var jwt 	= require('express-jwt');
var config  = require('./config');

var User  		= require('./controllers/user');
var Post 		= require('./controllers/post');
var Comment 	= require('./controllers/comment');
var Session 	= require('./controllers/session');

var jwtCheck = jwt({
  secret: config.secret
});

router.route('/users')
	.post(User.postUsers)
	.get(User.getUsers);

router.route('/users/:id')
	.get(User.getUser)
	.patch(jwtCheck,User.patchUser)
	.delete(jwtCheck,User.deleteUser);

router.route('/posts')
	.post(jwtCheck,Post.postPosts)
	.get(Post.getPosts)
	.delete(jwtCheck,Post.deletePosts);

router.route('/posts/:id')
	.get(Post.getPost)
	.patch(jwtCheck,Post.patchPost)
	.delete(jwtCheck,Post.deletePost);

router.route('/posts/users/:user_id')
	.get(Post.getUserPosts)
	.delete(jwtCheck,Post.deleteUserPosts);

router.route('/posts/:id/comments')
	.get(Post.getPostComments);

router.route('/comments')
	.post(jwtCheck,Comment.postComments)
	.get(Comment.getComments)
	.delete(jwtCheck,Comment.deleteComments);

router.route('/comments/:id')
	.get(Comment.getComment)
	.patch(jwtCheck,Comment.patchComment)
	.delete(jwtCheck,Comment.deleteComment);

router.route('/comments/users/:user_id')
	.get(Comment.getUserComments)
	.delete(jwtCheck,Comment.deleteUserComments);	

router.route('/sessions')
	.post(Session.postSession)
	.delete(jwtCheck,Session.deleteSession);

module.exports = router;
