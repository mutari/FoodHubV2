const express = require('express');
const router = express.Router();

const {body, check} = require('express-validator');
const user = require("../controllers/UserController");

const auth = require('../modules/UserAuth');
const login = require('../modules/UserLogin');

router.get('/login', user.renderLogin);
router.post('/login',[
    //valendering
    check('email', 'Somthing whent wronge white email').isEmail().normalizeEmail().not().isEmpty(),
    check('password', 'Somthing whent wronge white password').not().isEmpty()
], login, user.login);

router.get('/createacc', user.renderCreateAcc);
router.post('/createacc',[
    //valendering
    check('email', 'Somthing whent wronge white email').isEmail().normalizeEmail().not().isEmpty().custom(async (val, { req }) => {
        var email = await req.dbUser.findOne({email: val});
        if(email)
            return Promise.reject();
    }),
    body('username').trim().escape().not().isEmpty(),
    body('name').trim().escape().not().isEmpty(),
    check('password', 'Somthing whent wronge white password').not().isEmpty().custom((val, { req }) => val == req.body.password_rep)
], user.createAcc);

router.get('/logout', user.logout);

router.get('/profile', auth, user.getProfile); 
router.get('/profile/:id', user.getProfileById);

router.get('/save/:id', auth, user.saveFood);

router.get('/rewrite/profile', auth, user.renderRewriteProfile);
router.post('/rewrite/profile',[
    //valedering
    check('email', 'Email alredy exists').isEmail().normalizeEmail().custom(async (val, { req }) => {
        //får inte vara lik någon annan email i databasen
        var email = await req.dbUser.findOne({email: val});
        if(email && email._id != req.token.id) // email får vara samma som användaren nuvarande använder
            return Promise.reject();
    }),
    body('name').trim().escape().not(),
    body('phone').trim().escape().not()
], auth, user.rewriteProfile);

router.get('/image/:name', user.loadImage);

module.exports = router;