const jwt       = require('jsonwebtoken');
const {User}    = require('../models/users');

module.exports  = async function (req, res, next) {
    
    // if user came from cookie-session
    if (req.user) {

        // Issue a permant JWT for development 
        // const token = await jwt.sign({ userID: req.user.id }, getConfig('jwt.token'), { expiresIn: '9999 years'});
        // console.log(token)
        req.user.ip  = req.ip.substr(0, 7) == "::ffff:" ? req.ip.substr(7) : req.ip
        req.userinfo = req.user
        return next();
    }

    let token = req.header('token') ? req.header('token') :   
                req.body.token      ? req.body.token      : null

    // console.log('token header',req.header('token'))
    // console.log('token body'  ,req.body.token)
    // console.log('token',token)

    if (!token) return next({status:401,msg:'Unauthorized!, No Token Provided'});
    
    try {
        req.userinfo    = jwt.verify(token,getConfig('jwt.token'))
        req.user        = await User.findOne({userID:req.userinfo.userID})
    }
    catch (ex) {
        // console.log(ex)
        return next({status:401,msg:'Unauthorized!, invalid token'})
    }

    console.log(req.userinfo.ip)
    console.log(req.ip)

    if (req.userinfo.ip != req.ip) return next({status:401,msg:'Your ip address has changed, please log-in again.'})

    if (req.user) req.user.ip  = req.ip.substr(0, 7) == "::ffff:" ? req.ip.substr(7) : req.ip
    

    return next();
};
