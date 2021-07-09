module.exports = function(err, req, res, next) {

    if (err instanceof SyntaxError && err.status === 400 && 'body' in err)
        return next({status:400,msg:'JSON validation failed, Bad Request.'});
    else 
        return next();

}