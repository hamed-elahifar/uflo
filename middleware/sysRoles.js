
module.exports.sysAdmin = function(req,res,next) {

    if (!req.userinfo || !req.userinfo.isSysAdmin)
        return next({status:403,msg:'Forbidden!'});

    return next();
};


module.exports.isProfessor = function(req,res,next) {

    if (!req.userinfo || !req.userinfo.isProfessor)
        return next({status:403,msg:'Forbidden!'});

    return next();
    
};
