const router                    = require('express').Router()
  ,   {State}                   = require('../models/state')
  ,   {Lobj}                    = require('../models/lobj')
  ,   {Canvas}                  = require('../models/canvas')


  ,   Joi                       = require('@hapi/joi')

  ,   auth                      = require('../middleware/auth')

router.post('/list',[auth],async(req,res,next)=>{
    const schema  = Joi.object({

        lobjID:         Joi.string().required(),
        canvasID:       Joi.string().required(),

        token:          Joi.any().optional().allow('',null)

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {lobjID,canvasID} = req.body

    let query = {lobjID,canvasID}

    const [err,result] = await tojs(State.find(query))

    if (err) return next({status:500,msg:'Error',error:err})

    res.payload = result
    
    return next();
});
router.post('/add',[auth],async(req,res,next)=>{
    const schema  = Joi.object({

        lobjID:         Joi.string().required(),
        canvasID:       Joi.string().required(),
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

    const {lobjID,canvasID,startFrame,endFrame,type,transformation} = req.body

    const lobj = await Lobj.findOne({lobjID})
    if (!lobj) return next({status:404,msg:'lobj not found'})

    const canvas = await Canvas.findOne({canvasID})
    if (!canvas) return next({status:404,msg:'canvas not found'})

    const state = new State({lobjID,canvasID,startFrame,endFrame,type,transformation})

    const [err,result] = await tojs(state.save())

    if (err) return next({msg:'Error',error:err})

    res.payload = result

    return next();
});
router.post('/update',[auth],async(req,res,next)=>{
    const schema  = Joi.object({
        
        stateID:        Joi.string().required(),
        lobjID:         Joi.string().required(),
        canvasID:       Joi.string().required(),
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

    const {lobjID,canvasID,stateID,startFrame,endFrame,type,transformation} = req.body

    const state = await State.findOne({stateID})
    if (!state) return next({msg:'state not found'})

    const lobj = await Lobj.findOne({lobjID})
    if (!lobj) return next({status:404,msg:'lobj not found'})

    const canvas = await Canvas.findOne({canvasID})
    if (!canvas) return next({status:404,msg:'canvas not found'})

    state.lobjID         = lobjID         ? lobjID         : state.lobjID
    state.canvasID       = canvasID       ? canvasID       : state.canvasID
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
