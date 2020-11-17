
module.exports  = function(err, req, res, next) {  

    errorLog(err)

    let resp = {}

    resp.success = false,
    resp.status  = err.status || 500

    if (typeof err.msg == 'string'){
        resp.msg = err.msg || 'Sorry there was a system error, details of this error were sent to the technical team'

    } else if (Array.isArray(err.msg)){
        resp.msg = err.msg

    } else {
        resp.msg = 'Unknown Error Occurred'
    }
    
    resp.data    = res.payload && res.payload.data  ? res.payload.data : res.payload || ''

    if (getConfig('debug') == 'true') resp.error = err.error || undefined

    res.status(200).json(resp)

    return next();
}