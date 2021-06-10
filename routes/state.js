const router                    = require('express').Router()
  ,   {State}                   = require('../models/state')

  ,   Joi                       = require('@hapi/joi')

  ,   auth                      = require('../middleware/auth')

router.post('/list',[auth],async(req,res,next)=>{
    const schema  = Joi.object({

        // stateID:    Joi.string().required(),

        token:      Joi.any().optional().allow('',null)

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {stateID} = req.body

    let query = {}

    const [err,result] = await tojs(State.find(query))

    if (err) return next({status:500,msg:'Error',error:err})

    res.payload = result
    
    return next();
});
router.post('/add',[auth],async(req,res,next)=>{
    const schema  = Joi.object({

        startFrame:     Joi.string().required(),
        endFrame:       Joi.string().required(),
        type:           Joi.string().required().valid('enter','inview'),

        transformation: Joi.array().items(
            Joi.object({
                compId:     Joi.string().required(),
                attribute:  Joi.string().required(),
                value:      Joi.string().required(),
            })
        )
    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {startFrame,endFrame,type,transformation} = req.body

    const state = new State({startFrame,endFrame,type,transformation})

    const [err,result] = await tojs(state.save())

    if (err) return next({msg:'Error',error:err})

    res.payload = result

    return next();
});
router.post('/update',[auth],async(req,res,next)=>{
    const schema  = Joi.object({

        stateID:        Joi.string().required(),
        startFrame:     Joi.string().required(),
        endFrame:       Joi.string().required(),
        type:           Joi.string().required().valid('enter','inview'),

        transformation: Joi.array().items(
            Joi.object({
                compId:     Joi.string().required(),
                attribute:  Joi.string().required(),
                value:      Joi.string().required(),
            })
        )
    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {stateID,startFrame,endFrame,type,transformation} = req.body

    const state = await State.findOne({stateID})
    if (!state) return next({msg:'state not found'})


    state.startFrame     = startFrame     ? startFrame     : state.startFrame
    state.endFrame       = endFrame       ? endFrame       : state.endFrame
    state.type           = type           ? type           : state.type
    state.transformation = transformation ? transformation : state.transformation
    
    const [err,result] = await tojs(state.save())

    if (err) return next({status:500,msg:'faild',error:err})

    res.payload = result

    return next();
});
router.post('/delete',[auth],async(req,res,next)=>{
    const schema  = Joi.object({

        stateID:       Joi.string().required(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {stateID} = req.body

    const state = await State.findOneAndDelete({stateID})
    if (!state) return next({msg:'state not found'})

    res.payload = 'state deleted successfully'
    return next()
});

module.exports = router;
