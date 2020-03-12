const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    //testar om någon är inlogad
    if(req.cookies.token) {
        try {
            let token = jwt.verify(req.cookies.token, process.env.SECRET);
            delete token.iat;
            delete token.exp;
            req.token = token;

            next();
        }
        catch(err) {
            req.token = {username: "no-token"};
            next();
        }
    }
    else {
        req.token = {username: "no-token"};
        next();
    }
}