const router                    = require('express').Router()
  ,   {State}                   = require('../models/state')
  ,   {Lobj}                    = require('../models/lobj')
  ,   {Canvas}                  = require('../models/canvas')

  ,  {sysAdmin,isProfessor,isTA}
                                = require('../middleware/sysRoles')
  ,   Joi                       = require('joi')

  ,   auth                      = require('../middleware/auth')

router.post('/list',[auth,isTA],async(req,res,next)=>{
    const schema  = Joi.object({

        lobjID:         Joi.string().required(),

        token:          Joi.any().optional().allow('',null)

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {lobjID} = req.body

    let query = {lobjID}

    const [err,result] = await tojs(State.find(query).select('-id -_id -__v -createdAt -updatedAt'))

    if (err) return next({status:500,msg:'Error',error:err})

    res.payload = result
    
    return next();
});
router.post('/add',[auth,isProfessor],async(req,res,next)=>{
    const schema  = Joi.object({

        lobjID:         Joi.string().required(),
        canvasIDs:      Joi.array().items(Joi.string()).optional(),
        startFrame:     Joi.string().required(),
        endFrame:       Joi.string().required(),
        type:           Joi.string().required().valid('enter','inview'),

        transformation: Joi.array().items(
            Joi.object({
                desmosId:           Joi.string().required(),
                compId:             Joi.string().required(),
                attribute:          Joi.string().optional(),
                value:              Joi.string().optional(),
                latex:              Joi.string().optional(),
                expidx:             Joi.string().optional(),

                sliderBounds:       Joi.object({
                    min:            Joi.string().optional(),
                    max:            Joi.string().optional(),
                    step:           Joi.string().optional(),
                }).optional(),
                
                customAttr:         Joi.string().optional(),
                customTrans:        Joi.string().optional(),
            })
        )
    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {lobjID,canvasIDs,startFrame,endFrame,type,transformation} = req.body

    const lobj = await Lobj.findOne({lobjID})
    if (!lobj) return next({status:404,msg:'lobj not found'})

    // const canvas = await Canvas.findOne({canvasIDs})
    // if (!canvas) return next({status:404,msg:'canvas not found'})

    const state = new State({lobjID,canvasIDs,startFrame,endFrame,type,transformation})

    const [err,result] = await tojs(state.save())

    if (err) return next({msg:'Error',error:err})

    res.payload = result

    return next();
});
router.post('/upsert',[auth,isTA],async(req,res,next)=>{

    const schema  = Joi.array().items(
        Joi.object({
            
            stateID:        Joi.string().required(),
            lobjID:         Joi.string().required(),
            canvasIDs:      Joi.array().items(Joi.string()).optional(),
            startFrame:     Joi.string().required(),
            endFrame:       Joi.string().required(),
            type:           Joi.string().required().valid('enter','inview'),

            transformation: Joi.array().items(
                Joi.object({
                    desmosId:           Joi.string().required(),
                    compId:             Joi.string().required(),
                    attribute:          Joi.string().optional(),
                    value:              Joi.string().optional(),
                    latex:              Joi.string().optional(),
                    expidx:             Joi.string().optional(),

                    sliderBounds:       Joi.object({
                        min:            Joi.string().optional(),
                        max:            Joi.string().optional(),
                        step:           Joi.string().optional(),
                    }).optional(),

                    customAttr:         Joi.string().optional(),
                    customTrans:        Joi.string().optional(),
                })
            )
        })
    )
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});


    let arrayOfErrors = []

    for (item of req.body){
        const {lobjID,canvasIDs,stateID,startFrame,endFrame,type,transformation} = item

        const lobj = await Lobj.findOne({lobjID})
        if (!lobj) return next({status:404,msg:'lobj not found'})

        const state = await State.findOne({stateID})
        if (!state) {

            await State.create({
                lobjID,canvasIDs,startFrame,endFrame,type,transformation
            })

        } else {
            // const canvas = await Canvas.findOne({canvasIDs})
            // if (!canvas) return next({status:404,msg:'canvas not found'})
        
            state.lobjID         = lobjID         ? lobjID         : state.lobjID
            state.canvasIDs      = canvasIDs      ? canvasIDs      : state.canvasIDs
            state.startFrame     = startFrame     ? startFrame     : state.startFrame
            state.endFrame       = endFrame       ? endFrame       : state.endFrame
            state.type           = type           ? type           : state.type
            state.transformation = transformation ? transformation : state.transformation
            
            const [err,result] = await tojs(state.save())

            if (err) arrayOfErrors.push(err)
        }

    }

    if (!arrayOfErrors.isEmpty) return next({status:500,msg:'faild',error:err})

    res.payload = {msg:'successful'}

    return next();
});
router.post('/delete',[auth,isProfessor],async(req,res,next)=>{
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
