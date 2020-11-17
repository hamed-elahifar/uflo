
module.exports.sysAdmin = function(req,res,next) {

    if (!req.userinfo || !req.userinfo.isSysAdmin)
        return next({status:403,msg:'you are not authorized'});

    return next();  
};
