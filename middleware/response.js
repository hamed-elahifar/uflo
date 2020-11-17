
module.exports = async(req,res,next)=>{

    if (!res.payload){
        res.status(404).json({
            success: false,
            status:  404,
            msg:    'Route not found, nor payload provided.'
        })

        return next();
    }

    let resp = {}

    resp.success        = true,
    resp.msg            = res.payload.msg  || ''
    resp.data           = res.payload.data || res.payload

    resp.data.status    = undefined
    resp.data.msg       = undefined

    res.status(200).json(resp)

    return next();
}
