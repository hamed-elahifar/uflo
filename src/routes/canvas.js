const router            = require('express').Router()
  ,   {Lobj}            = require('../models/lobj')
  ,   {Canvas}          = require('../models/canvas')

  ,   axios             = require('axios')

  ,   Joi               = require('@hapi/joi')

  ,  {sysAdmin,isProfessor,isTA}
                        = require('../middleware/sysRoles')
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

    const [err,result] = await tojs(Canvas.find(query).select('-id -_id -__v -createdAt -updatedAt'))

    res.payload = result
    
    return next();
});
router.post('/add',[auth,isTA],async(req,res,next)=>{

    const schema  = Joi.object({

        lobjID:             Joi.string().required(),
        type:               Joi.string().required().valid('Desmos'),
        stateZero:          Joi.string().required(),

        token:              Joi.any().allow(null,'').optional(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {lobjID,type,stateZero} = req.body

    const lobj = await Lobj.findOne({lobjID})
    if (!lobj) return next({status:404,msg:'LOBJ not found'})

    const canvas = new Canvas({lobjID,type,stateZero})

    const [err,result] = await tojs(canvas.save())

    if (err) return next({status:500,msg:'faild',error:err})

    res.payload = result

    return next();
});
router.post('/upsert',[auth,isTA],async(req,res,next)=>{

    const schema  = Joi.array().items(

        Joi.object({

            canvasID:           Joi.string().optional(),
            lobjID:             Joi.string().required(),
            type:               Joi.string().required(),
            stateZero:          Joi.string().required(),

            token:              Joi.any().allow(null,'').optional(),

        })
    )

    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    let arrayOfErrors = []

    for (item of req.body){

        const {canvasID,lobjID,type,stateZero} = item

        const lobj = await Lobj.findOne({lobjID})
        if (!lobj) return next({status:404,msg:'LOBJ not found'})

        const canvas = await Canvas.findOne({canvasID})

        if (!canvas) {

            await Canvas.create({
                lobjID,type,stateZero
            })

        } else {

            canvas.lobjID       = lobjID        ? lobjID        : canvas.lobjID
            canvas.type         = type          ? type          : canvas.type
            canvas.stateZero    = stateZero     ? stateZero     : canvas.stateZero
        
            const [err,result]  = await tojs(canvas.save())

            if (err) arrayOfErrors.push(err)

        }

    }

    if (!arrayOfErrors.isEmpty) return next({status:500,msg:'faild',error:err})

    res.payload = {msg:'successful'}

    return next();
});
router.post('/delete',[auth,isProfessor],async(req,res,next)=>{
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
router.post('/StateZeroWithUrl',async(req,res,next)=>{

    const url = req.body.url || req.query.url;

    const response = await axios.get(url,{
        headers: {
            accept: 'application/json',
        }
    });
    
    if(response) res.payload = response.data

    return next();

});

module.exports = router;