const express = require('express');
const Comment = require('../models/comment');
const authenticate = require('../authenticate');

const commentRouter = express.Router();

commentRouter.route('/')
.get((req, res, next) => {
    Comment.find()
    .then(comments => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(comments);
    })
    .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    Comment.create(req.body)
    .then(comment => {
        console.log('Comment Created ', comment);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(comment);
    })
    .catch(err => next(err));
})
.put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /comments');
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Comment.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

commentRouter.route('/:commentId')
.get((req, res, next) => {
    Comment.findById(req.params.commentId)
    .then(comment => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(comment);
    })
    .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /comments/${req.params.commentId}`);
})
.put(authenticate.verifyUser, (req, res) => {
    Comment.findByIdAndUpdate(req.params.commentId, {
        $set: req.body
    }, { new: true })
    .then(comment => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(comment);
    })
    .catch(err => next(err));
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Comment.findByIdAndDelete(req.params.commentId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

module.exports = commentRouter;