const jwt = require('jsonwebtoken');
const config = require('config');


module.exports = function(req, res, next){
    const token = req.header('x-auth-token');

    if(!token){
        return res.status(401).json({msg:'No token, not authorised'});
    }

    try {
        const decode = jwt.verify(token, config.get('jwtsecret'));
        req.user = decode.user;
        next();
    } catch (err) {
        console.error(err.message);
        res.status(401).json({msg:'Token not valid'});
    }
}