const jwt           = require('jsonwebtoken')

module.exports  = async function (req, res, next) {
    let token = req.header('token') ? req.header('token') :   
                req.body.token      ? req.body.token      : null

    if (!token) return next({status:401,msg:'Access Denied, No Token Provided'});
    
    try {req.userinfo = jwt.verify(token, getConfig('jwt.token'))}
    catch (ex) {return next({status:401,msg:'invalid token'})}

    req.userinfo.ip = req.ip.substr(0, 7) == "::ffff:" ? req.ip.substr(7) : req.ip

    return next();
};