module.exports = async (req,res,next) => {
    const bcrypt = require("bcryptjs");
    const jwt = require("jsonwebtoken");
    const ObjectID = require('mongodb').ObjectID;
   
    
    //på något sätt måste jag hämta lösen i från databas
 
    let user = await req.dbUser.findOne({"email": req.body.email});;

    if(user)
    {
        const password = req.body.password;
        const hash = user.hash;  // hashat lösenord från db/fil/minnede
        //Kontrollera lösenord med bcrypt
        bcrypt.compare(password,hash,function(err,success){
          
            if(success){
 
                const token = jwt.sign({name: user.name, email:user.email, username: user.username, id: ObjectID(user._id)}, process.env.SECRET, {expiresIn:60*60}) //man blir inlågad  i en timmer
 
                req.token = token
                 
                next();
            }
            else
                res.redirect("/login?login error");
        });
    }
    else
        res.redirect("/login?login error");

   
}