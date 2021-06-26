const router                    = require('express').Router()
  ,   {Flomotion}               = require('../models/flomotion')
  ,   Joi                       = require('@hapi/joi')

  ,  {sysAdmin,isProfessor,isTA}
                                = require('../middleware/sysRoles')
  ,   auth           = require('../middleware/auth')


router.post('/get',[auth,isTA],async(req,res,next)=>{
    
    const result = await Flomotion.findOne({_id:req.body.id})

    res.payload = result
    
    return next();
});
router.post('/add',[auth,isTA],async(req,res,next)=>{
    
    const {flomotiondesmos,animation} = req.body

    const result = await Flomotion.create({flomotiondesmos,animation})

    res.payload  = result

    return next();
});
router.post('/update',[auth,isTA],async(req,res,next)=>{
    
    const {id,flomotiondesmos,animation} = req.body

    const result = await Flomotion.findOneAndUpdate({_id:id},{$set:{flomotiondesmos,animation}})

    res.payload = result

    return next();
});


module.exports = router;
