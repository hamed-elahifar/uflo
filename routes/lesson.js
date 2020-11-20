const router                    = require('express').Router()
  ,   {Lesson}                  = require('../models/lessons')

  ,   Joi                       = require('@hapi/joi')

  ,  {sysAdmin}                 = require('../middleware/sysRoles')
  ,   auth                      = require('../middleware/auth')

router.post('/list',async(req,res,next)=>{
    const schema  = Joi.object({
        
    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {} = req.body

    const [err,result] = await tojs(Lesson.find({}))

    res.payload = result
    
    return next();
});

module.exports = router;
