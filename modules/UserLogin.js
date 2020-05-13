module.exports = async (req,res,next) => {
    const bcrypt = require("bcryptjs");
    const jwt = require("jsonwebtoken");
    const ObjectID = require('mongodb').ObjectID;
    const { validationResult } = require('express-validator');

    const errors = validationResult(req);
    if(errors.isEmpty()) {
        //på något sätt måste jag hämta lösen i från databas
     
        let user = await req.dbUser.findOne({"email": req.body.email});;

        if(user)
        {
            const password = req.body.password;
            const hash = user.hash;  // hashat lösenord från db/fil/minnede
            console.log('find hash :: ', user);
            //Kontrollera lösenord med bcrypt
            bcrypt.compare(password,hash,function(err,success){
            
                if(success){
    
                    const token = jwt.sign({name: user.name, email:user.email, username: user.username, id: ObjectID(user._id)}, process.env.SECRET, {expiresIn:60*60}) //man blir inlågad  i en timmer
    
                    req.token = token
                    
                    next();
                }
                else {
                    console.log('försökte logga in och misslyckades med compare');
                    res.redirect("/login?fel lösenord");
                }
            });
        }
        else {
            console.log('försökte logga in och användarnamnet fel');
            res.redirect("/login?emailen finns inte i databasen");
        }
    }
    else { 
        console.log(`validation errors:`, errors);
        res.redirect('/login?that email is not alowed');
    }
   
}