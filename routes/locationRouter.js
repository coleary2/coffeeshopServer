const express = require('express');
const Location = require('../models/location');
const authenticate = require('../authenticate');
const cors = require('./cors');

const locationRouter = express.Router();

locationRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Location.find()
    .populate('comments.author')
    .then(locations => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(locations);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Location.create(req.body)
    .then(location => {
        console.log('Location Created ', location);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(location);
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /locations');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Location.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

locationRouter.route('/:locationId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Location.findById(req.params.locationId)
    .populate('comments.author')
    .then(location => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(location);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /locations/${req.params.locationId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Location.findByIdAndUpdate(req.params.locationId, {
        $set: req.body
    }, { new: true })
    .then(location => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(location);
    })
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Location.findByIdAndDelete(req.params.locationId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

locationRouter.route('/:locationId/comments')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Location.findById(req.params.locationId)
    .populate('comments.author')
    .then(location => {
        if (location) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(location.comments);
        } else {
            err = new Error(`Location ${req.params.locationId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err=> next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Location.findById(req.params.locationId)
    .then(location => {
        if (location) {
            req.body.author = req.user._id;
            location.comments.push(req.body);
            location.save()
            .then(location => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(location);
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Location ${req.params.locationId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /locations/${req.params.locationId}/comments`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Location.findById(req.params.locationId)
    .then(location => {
        if (location) {
            for (let i = (location.comments.length-1); i >= 0; i--) {
                location.comments.id(location.comments[i]._id).remove();
            }
            location.save()
            .then(location => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(location);
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Location ${req.params.locationId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});
locationRouter.route('/:locationId/comments/:commentId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Location.findById(req.params.locationId)
    .populate('comments.author')
    .then(location => {
        if (location && location.comments.id(req.params.commentId)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(location.comments.id(req.params.commentId));
        } else if (!location) {
            err = new Error(`Location ${req.params.locationId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /locations/${req.params.locationId}/comments/${req.params.commentId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Location.findById(req.params.locationId)
    .then(location => {
        if (location && location.comments.id(req.params.commentId)) {
            if((location.comments.id(req.params.commentId).author._id).equals(req.user._id)) {
                if (req.body.rating) {
                    location.comments.id(req.params.commentId).rating = req.body.rating;
                }
                if (req.body.text) {
                    location.comments.id(req.params.commentId).text = req.body.text;
                }
                location.save()
                .then(location => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(location);
                })
                .catch(err => next(err));
            } else {
                err = new Error ('You are not authorized to upadate this comment!');
                err.status = 403;
                return next(err);
            }
        } else if (!location) {
            err = new Error(`Location ${req.params.locationId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Location.findById(req.params.locationId)
    .then(location => {
        if (location && location.comments.id(req.params.commentId)) {
            if((location.comments.id(req.params.commentId).author._id).equals(req.user._id)) {
                location.comments.id(req.params.commentId).remove();
                location.save()
                .then(location => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(location);
                })
                .catch(err => next(err));
            } else {
                err = new Error('You are not authorized to delete this comment!');
                err.status = 403;
                return next(err);
            }
        } else if (!location) {
            err = new Error(`Location ${req.params.locationId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});

module.exports = locationRouter;