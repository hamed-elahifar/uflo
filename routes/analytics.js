const router                    = require('express').Router()
  ,   {Analytics}               = require('../models/analytics')

  ,   Joi                       = require('@hapi/joi')

  ,   {sysAdmin}                = require('../middleware/sysRoles')
  ,   auth                      = require('../middleware/auth')

router.post('/add',[auth],async(req,res,next)=>{
    const schema  = Joi.object({

        frameID:    Joi.string().required(),
        startDate:  Joi.string().required(),
        duration:   Joi.string().required(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {frameID,startDate,duration} = req.body

    const analytic = new Analytics({
        frameID,startDate,duration,
        userID:req.userinfo.userID,
    })

    const [err,result] = await tojs(analytic.save())

    if (err) return next({msg:'Error',error:err})

    res.payload = result

    return next();
});

module.exports = router;
