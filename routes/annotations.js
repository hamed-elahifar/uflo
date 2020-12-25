const router            = require('express').Router()
  ,   {Annotation}      = require('../models/annotations')
  ,   {Lesson}          = require('../models/lessons')

  ,   Joi               = require('@hapi/joi')

  ,  {sysAdmin}         = require('../middleware/sysRoles')
  ,   auth              = require('../middleware/auth')

router.post('/list',[auth],async(req,res,next)=>{
    const schema  = Joi.object({
        
        lessonID:   Joi.string().required(),
        userID:     Joi.string().optional(),

        token:      Joi.any().optional().allow('',null)
    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {lessonID,userID} = req.body

    let query = {lessonID}

    const [err,result] = await tojs(Annotation.find(query))

    res.payload = result

    return next();
});
router.post('/add',[auth],async(req,res,next)=>{

    const schema  = Joi.object({

        desc:               Joi.string().required(),
        type:               Joi.string().valid('highlight','annotation','question').required(),
        tag:                Joi.array() .items(Joi.string()),

        selection:          Joi.array() .items(Joi.object({
            frameID:        Joi.string().required(),
            startIndex:     Joi.number().required(),
            selectLength:   Joi.number().required(),
            quote:          Joi.string().required(),
        })),
        color:              Joi.string().required(),
        
        whomToAsk:          Joi.string().valid('professor','TA','everyone').required(),

        reply:              Joi.object({
            replyText:      Joi.string().required(),
            userID:         Joi.string().required(),
            solution:       Joi.boolean(),
        }),

        lessonID:           Joi.string().required(),

        token:              Joi.any().allow(null,'').optional(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {desc,type,tag,selection,color,whomToAsk,reply,lessonID} = req.body

    const lesson = await Lesson.findOne({lessonID})
    if (!lesson) return next({status:404,msg:'lesson not found'})

    let anntLength = 0
    selection.forEach(i => {anntLength += +i.selectLength})

    const annotation = new Annotation({
        desc,type,tag,selection,color,whomToAsk,reply,lessonID,
        anntLength,
        userID:             req.userinfo.userID,
        descLength:         desc.length,
    })
    
    const [err,result] = await tojs(annotation.save())

    if (err) return next({status:500,msg:'faild',error:err})

    res.payload = result

    return next();
});
router.post('/update',[auth],async(req,res,next)=>{

    const schema  = Joi.object({

        annotationID:       Joi.string().required(),
        desc:               Joi.string().required(),
        type:               Joi.string().valid('highlight','annotation','question').required(),
        tag:                Joi.array() .items(Joi.string()),

        selection:          Joi.array() .items(Joi.object({
            frameID:        Joi.string().required(),
            startIndex:     Joi.number().required(),
            selectLength:   Joi.number().required(),
            quote:          Joi.string().required(),
        })),
        color:              Joi.string().required(),
        
        whomToAsk:          Joi.string().valid('professor','TA','everyone').required(),

        reply:              Joi.object({
            replyText:      Joi.string().required(),
            userID:         Joi.string().required(),
            solution:       Joi.boolean(),
        }),

        lessonID:           Joi.string().required(),

        token:              Joi.any().allow(null,'').optional(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {annotationID,desc,type,tag,selection,color,whomToAsk,reply,lessonID} = req.body

    const annotation = await Annotation.findOne({annotationID})
    if (!annotation) return next({status:404,msg:'Annotation not found'})

    const lesson = await Lesson.findOne({lessonID})
    if (!lesson) return next({status:404,msg:'lesson not found'})

    annotation.desc         = desc      ? desc      : annotation.desc
    annotation.type         = type      ? type      : annotation.type
    annotation.tag          = tag       ? tag       : annotation.tag
    annotation.selection    = selection ? selection : annotation.selection
    annotation.color        = color     ? color     : annotation.color
    annotation.whomToAsk    = whomToAsk ? whomToAsk : annotation.whomToAsk
    annotation.lessonID     = lessonID  ? lessonID  : annotation.lessonID
    
    annotation.descLength   = desc.length
    anntLength = 0
    annotation.anntLength   = selection.forEach(i => {anntLength += +i.selectLength})


    const [err,result] = await tojs(annotation.save())

    if (err) return next({status:500,msg:'faild',error:err})

    res.payload = result

    return next();
});
router.post('/delete',[auth],async(req,res,next)=>{
    const schema  = Joi.object({

        annotationID:     Joi.string().required(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {annotationID} = req.body

    const annotation = await Annotation.findOneAndDelete({annotationID})
    if (!annotation) return next({status:404,msg:'Annotation not found'})

    res.payload = 'successful'
    return next()
});
router.post('/reply',[auth],async(req,res,next)=>{
    // @TODO
});
router.post('/likes',[auth],async(req,res,next)=>{
    // @TODO
});
module.exports = router;