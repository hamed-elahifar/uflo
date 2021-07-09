
module.exports.sysAdmin = function(req,res,next) {

    if (!req.userinfo || req.userinfo.role != 'admin')
        return next({status:403,msg:'Forbidden!'});

    return next();
};


module.exports.isProfessor = function(req,res,next) {

    const acceptableRolls = ['admin','professor']
    if (!req.userinfo || !acceptableRolls.includes(req.userinfo.role))
        return next({status:403,msg:'Forbidden!'});

    return next();
    
};

module.exports.isTA = function(req,res,next) {

    const acceptableRolls = ['admin','professor','TA']
    if (!req.userinfo || !acceptableRolls.includes(req.userinfo.role))
        return next({status:403,msg:'Forbidden!'});

    return next();

};