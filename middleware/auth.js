const jwt       = require('jsonwebtoken')

module.exports  = async function (req, res, next) {

    const ip = req.ip.substr(0, 7) == "::ffff:" ? req.ip.substr(7) : req.ip
    
    // if user came from cookie-session
    if (req.user) {
        req.user.ip  = ip
        req.userinfo = req.user
        return next();
    }
   
    let token = req.header('token') ? req.header('token') :   
                req.body.token      ? req.body.token      : null

    // console.log('token',token)

    if (!token) return next({status:401,msg:'Access Denied, No Token Provided'});
    
    try {req.userinfo = jwt.verify(token, getConfig('jwt.token'))}
    catch (ex) {return next({status:401,msg:'invalid token'})}

    req.userinfo.ip = ip

    return next();
};