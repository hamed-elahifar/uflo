
module.exports.sysAdmin = function(req,res,next) {

    const acceptableRolls = ['admin']

    if (!compare(acceptableRolls,req?.userinfo?.role))
        return next({status:403,msg:'Forbidden!'});

    return next();

};


module.exports.isProfessor = function(req,res,next) {

    const acceptableRolls = ['admin','professor']

    if (!compare(acceptableRolls,req?.userinfo?.role))
        return next({status:403,msg:'Forbidden!'});

    return next();
    
};

module.exports.isTA = function(req,res,next) {

    const acceptableRolls = ['admin','professor','TA']

    if (!compare(acceptableRolls,req?.userinfo?.role))
        return next({status:403,msg:'Forbidden!'});

    return next();

};

compare = (arrA, arrB) => arrA.some(item => arrB.includes(item))