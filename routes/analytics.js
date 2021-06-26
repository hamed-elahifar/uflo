const router                    = require('express').Router()
  ,   {Analytics}               = require('../models/analytics')
  ,   Joi                       = require('@hapi/joi')
  ,   auth                      = require('../middleware/auth')

router.post('/add',[auth],async(req,res,next)=>{
    const schema  = Joi.object({
        
        courseID:   Joi.string().required(),
        chapterID:  Joi.string().required(),
        lessonID:   Joi.string().required(),
        lobjID:     Joi.string().required(),
        frameID:    Joi.string().required(),
        startDate:  Joi.string().required(),
        duration:   Joi.string().required(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {courseID,chapterID,lessonID,lobjID,frameID,startDate,duration} = req.body

    const analytic = new Analytics({
        courseID,chapterID,lessonID,lobjID,
        frameID,startDate,duration,
        userID:req.userinfo.userID,
    })

    const [err,result] = await tojs(analytic.save())

    if (err) return next({msg:'Error',error:err})

    res.payload = result

    return next();
});

module.exports = router;
