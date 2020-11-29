const jwt       = require('jsonwebtoken');
const { User } = require('../models/users');

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

    if (!token) return next({status:401,msg:'Unauthorized!, No Token Provided'});
    
    try {
        req.userinfo    = jwt.verify(token,getConfig('jwt.token'))
        req.user        = await User.findOne({userID:req.userinfo.userID})
    }
    catch (ex) {
        return next({status:401,msg:'Unauthorized!, invalid token'})
    }

    req.user.ip = ip

    return next();
};