const express = require('express');
const Menu = require('../models/menu');
const authenticate = require('../authenticate');

const menuRouter = express.Router();

menuRouter.route('/')
.get((req, res, next) => {
    Menu.find()
    .then(menus => {
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(menus);
    })
    .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    Menu.create(req.body)
    .then(menu => {
        console.log('Menu Created ', menu);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(menu);
    })
    .catch(err => next(err));
})
.put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /menus');
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Menu.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

menuRouter.route('/:menuId')
.get((req, res, next) => {
    Menu.findById(req.params.menuId)
    .then(menu => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(menu);
    })
    .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /menus/${req.params.menuId}`);
})
.put(authenticate.verifyUser, (req, res, next) => {
    Menu.findByIdAndUpdate(req.params.menuId, {
        $set: req.body
    }, { new: true })
    .then(menu => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(menu);
    })
    .catch(err => next(err));
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Menu.findByIdAndDelete(req.params.menuId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

module.exports = menuRouter;