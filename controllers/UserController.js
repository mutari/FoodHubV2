const bcrypt = require('bcryptjs');
const ObjectID = require('mongodb').ObjectID;
const { validationResult } = require('express-validator');
const path = require('path');

module.exports = {

    renderLogin: (req, res) => {
        res.render("login")
    },

    renderCreateAcc: (req, res) => {
        res.render("createAcc", {logedIn: req.token.username});
    },

    renderRewriteProfile: async (req, res) => {
        try {
            const data = await req.dbUser.findOne({"_id": ObjectID(req.token.id)});
            res.render('rewriteProfile', data);
        } catch (err) {console.log(`Somthing whent wrong, route: renderRewriteProfile, msg: ${err}`);}
    
    },

    login: (req, res) => {
        try {
            let token  = req.token;
            res.cookie("token",token,{httpOnly:true,sameSite:"Strict"});
            res.redirect("/profile")
        } catch (err) {console.log(`Somthing whent wrong, route: login, msg: ${err}`);}
    },

    createAcc: async (req, res) => {

        //Om jag vill kan jag testa att validera en email i genom att skicka ett email med en kod som man måste skriva in

        try {
            //måste validera alla inputs inan jag tillåter en att skapa ett konto
            const errors = validationResult(req);
            if(errors.isEmpty()) {
                console.log(req.body.password);
                bcrypt.hash(req.body.password, 12, async (err, hash) => {
                    delete req.body.password;
                    delete req.body.password_rep;
                    req.body.hash = hash;
                    req.body.save = [];
                    await req.dbUser.insertOne(req.body);
                });
                res.redirect('/');
            }
            else { 
                console.log(`validation errors:`, errors);
                req.body.msg = errors.errors[0].msg;
                res.render("createAcc", {old: req.body, logedIn: req.token.username});
            }

        } catch (err) {console.log(`Somthing whent wrong, route: createAcc, msg: ${err}`);}

    }, 

    logout: (req, res) => {
        res.cookie("token", "loged out", {httpOnly: true, sameSite:"Strict"});
        res.redirect('/')
    },


    //need to go over
    getProfile: async (req, res) => {
        try {
             //måste hämta alla respt skrivna av den inlågade profilen
            const food = await req.dbFood.find({"user.username": req.token.username}).toArray();
            const user = await req.dbUser.findOne({"email": req.token.email});
            //hämtar alla rätter sparade av användaren
            
            let save = user.save.map(async e => {
                return await req.dbFood.findOne({"_id": ObjectID(e)});
            })
            //väntar på att map funktionen ska bli helt klar med alla 'async await'
            save = await Promise.all(save);

            user.foods = food;
            user.save = save;
            
            res.render('profile', {...user, logedIn: req.token.username});
        } catch (err) {console.log(`Somthing whent wrong, route: getProfile, msg: ${err}`);}
    },

    getProfileById: async (req, res) => {
        
        var user = await req.dbUser.findOne({"_id": ObjectID(req.params.id)});
        var foods = await req.dbFood.find({"user.id": req.params.id}).toArray();
        delete user.hash;

        let save = user.save.map(async e => {
            return await req.dbFood.findOne({"_id": ObjectID(e)});
        })
        //console.log(await app.dbFood.findOne({"_id": ObjectID(user.save[0])}))

        save = await Promise.all(save);

        user.foods = foods;
        user.save = save;

        res.render('viewProfile', {...user, logedIn: req.token.username});

    },

    rewriteProfile: async (req, res) => {

        try {

            const errors = validationResult(req);
            if(errors.isEmpty()) {
                await req.dbUser.updateOne({"_id": ObjectID(req.token.id)}, {"$set": req.body});   
                res.redirect('/profile');
            }
            else { 
                console.log(`validation errors:`, errors);
                res.render('/profile?somthing whent wrong whit the changes and they did not applay');
            }
        } catch(err) {console.log(`Somthing whent wrong, route: rewriteProfile, msg: ${err}`);}

    },

    saveFood: async (req, res) => {

        let user = await req.dbUser.findOne({"email": req.token.email});
        if(!user.save.find((e) => e == req.params.id)) {
            user.save.push(req.params.id);
            await req.dbUser.updateOne({"email": req.token.email}, {$set: user});
            res.redirect('back');
        }
        else {
            user.save = user.save.filter(e => e != req.params.id)
            await req.dbUser.updateOne({"email": req.token.email}, {$set: user});
            res.redirect('back');
        }


    },

    loadImage: (req, res) => {
        res.sendFile(path.join(__dirname, '/../images/', req.params.name));
    }


}