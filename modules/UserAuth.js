const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

    if(req.cookies.token) {
        try {

            let token = jwt.verify(req.cookies.token, process.env.SECRET)
            delete token.iat;
            delete token.exp;
            req.token = token;

            if(token)
                next()
            else
                res.redirect('/login')

        }
        catch(err) {
            res.redirect('/login')
        }
    }
    else
        res.redirect('/login')

}