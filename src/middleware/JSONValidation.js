module.exports = function(err, req, res, next) {

    req.ip = req.ip.substr(0, 7) == "::ffff:" ? req.ip.substr(7) : req.ip

    if (err instanceof SyntaxError && err.status === 400 && 'body' in err)
        return next({status:400,msg:'JSON validation failed, Bad Request.'});
    else 
        return next();

}