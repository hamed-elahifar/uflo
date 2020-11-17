const router                    = require('express').Router()
  ,   {Lesson}                  = require('../models/lessons')

  ,   Joi                       = require('@hapi/joi')

  ,  {sysAdmin}                 = require('../middleware/sysRoles')
  ,   auth                      = require('../middleware/auth')

router.post('/list',async(req,res,next)=>{
    const schema  = Joi.object({
        
    })
    const {error} = schema.validate(req.body,{abortEarly:false});
    if (error) return next({status:400,msg:error.details.map(x=>x.message)});

    const {} = req.body

    const [err,result] = await tojs(Lesson.find({}))

    res.payload = result
    
    return next();
});

module.exports = router;
