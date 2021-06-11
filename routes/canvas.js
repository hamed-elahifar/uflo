const router            = require('express').Router()
  ,   {Lobj}            = require('../models/lobj')
  ,   {Canvas}          = require('../models/canvas')

  ,   axios             = require('axios')

  ,   Joi               = require('@hapi/joi')

  ,  {sysAdmin}         = require('../middleware/sysRoles')
  ,   auth              = require('../middleware/auth')

router.post('/list',[auth],async(req,res,next)=>{
    const schema  = Joi.object({
        
        lobjID:     Joi.string().required(),

        token:      Joi.any().optional().allow('',null)
    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {lobjID} = req.body

    let query = {lobjID}

    const [err,result] = await tojs(Canvas.find(query))

    res.payload = result
    
    return next();
});
router.post('/add',[auth],async(req,res,next)=>{

    const schema  = Joi.object({

        lobjID:             Joi.string().required(),
        startFrame:         Joi.string().required(),
        endFrame:           Joi.string().required(),
        type:               Joi.string().required().valid('Desmos'),
        code:               Joi.string().required(),

        token:              Joi.any().allow(null,'').optional(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {lobjID,startFrame,endFrame,type,code} = req.body

    const lobj = await Lobj.findOne({lobjID})
    if (!lobj) return next({status:404,msg:'LOBJ not found'})

    const canvas = new Canvas({lobjID,startFrame,endFrame,type,code})

    const [err,result] = await tojs(canvas.save())

    if (err) return next({status:500,msg:'faild',error:err})

    res.payload = result

    return next();
});
router.post('/update',[auth],async(req,res,next)=>{

    const schema  = Joi.object({

        canvasID:           Joi.string().required(),
        lobjID:             Joi.string().required(),
        startFrame:         Joi.string().required(),
        endFrame:           Joi.string().required(),
        type:               Joi.string().required(),
        code:               Joi.string().required(),

        token:              Joi.any().allow(null,'').optional(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {canvasID,lobjID,startFrame,endFrame,type,code} = req.body

    const canvas = await Canvas.findOne({canvasID})
    if (!canvas) return next({status:404,msg:'canvas not found'})

    const course = await Lobj.findOne({lobjID})
    if (!course) return next({status:404,msg:'LOBJ not found'})

    canvas.lobjID = lobjID ? lobjID : canvas.lobjID

    canvas.startFrame   = startFrame    ? startFrame    : canvas.startFrame
    canvas.endFrame     = endFrame      ? endFrame      : canvas.endFrame
    canvas.type         = type          ? type          : canvas.type
    canvas.code         = code          ? code          : canvas.code

    const [err,result] = await tojs(canvas.save())

    if (err) return next({status:500,msg:'faild',error:err})

    res.payload = result

    return next();
});
router.post('/delete',[auth],async(req,res,next)=>{
    const schema  = Joi.object({

        canvasID:     Joi.string().required(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {canvasID} = req.body

    const canvas = await Canvas.findOneAndDelete({canvasID})
    if (!canvas) return next({status:404,msg:'canvas not found'})

    res.payload = 'successful'
    return next()
});
// temporary
router.post('/StateZeroWithUrl',[auth],async(req,res,next)=>{

    const url = req.query ? req.query.url: req.body.url;

    const response = await axios.get(url,{
        headers: {
            accept: 'application/json',
        }
    });
    
    if(response) res.payload = response.data

    return next();

});

module.exports = router;