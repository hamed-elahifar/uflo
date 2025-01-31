const router            = require('express').Router()
  ,   {Course}          = require('../models/courses')
  ,   {Chapter}         = require('../models/chapter')
  ,   {Lesson}          = require('../models/lessons')
  ,   {Lobj}            = require('../models/lobj')
  ,   {Frame}           = require('../models/frames')
  ,   {Canvas}          = require('../models/canvas')
  ,   {State}           = require('../models/state')

  ,   Joi               = require('joi')

  ,  {sysAdmin,isProfessor,isTA}
                        = require('../middleware/sysRoles')
  ,   auth              = require('../middleware/auth')

router.post('/list',[auth],async(req,res,next)=>{
    const schema  = Joi.object({
        
        lessonID:   Joi.string().required(),

        token:      Joi.any().optional().allow('',null)
    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {lessonID} = req.body

    let query = {lessonID}

    const [err,result] = await tojs(Lobj.find(query).select('-id -_id -__v -createdAt -updatedAt'))

    res.payload = result
    
    return next();
});
router.post('/add',[auth,isProfessor],async(req,res,next)=>{

    const schema  = Joi.object({

        name:               Joi.string().required(),
        desc:               Joi.string().required(),
        lessonID:           Joi.string().required(),
        order:              Joi.number().required(),
        frames:             Joi.array().items(Joi.number()),
        code:               Joi.string().optional().allow(null,''),

        token:              Joi.any().allow(null,'').optional(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {name,desc,lessonID,order,frames,code} = req.body

    const lesson = await Lesson.findOne({lessonID})
    if (!lesson) return next({status:404,msg:'lesson not found'})

    const chapter = await Chapter.findOne({chapterID:lesson.chapterID})
    if (!chapter) return next({status:404,msg:'chapter not found'})

    const course = await Course.findOne({courseID:chapter.courseID})
    if (!course) return next({status:404,msg:'course not found'})

    const lobj = new Lobj({
        name,
        desc,
        order,
        frames,
        lessonID,
        code,
        chapterID:  chapter.chapterID,
        courseID:   course.courseID,
    })

    const [err,result] = await tojs(lobj.save())

    if (err) return next({status:500,msg:'faild',error:err})

    res.payload = result

    return next();
});
router.post('/upsert',[auth,isTA],async(req,res,next)=>{

    const schema  = Joi.array().items(
    
        Joi.object({

            lessonID:           Joi.string().required(),
            name:               Joi.string().required(),
            desc:               Joi.string().required(),
            lobjID:             Joi.string().required(),
            order:              Joi.number().required(),
            frames:             Joi.array().items(Joi.number()),
            code:               Joi.string().optional().allow(null,''),

            token:              Joi.any().allow(null,'').optional(),

        })
    )
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    let arrayOfErrors = []

    for (item of req.body){

        const {lessonID,name,desc,lobjID,order,frames,code} = item

        const lobj = await Lobj.findOne({lobjID})
        if (!lobj) return next({status:404,msg:'lobj not found'})
    
        const lesson = await Lesson.findOne({lessonID:lobj.lessonID}).lean()
        if (!lesson) return next({status:404,msg:'lesson not found'})
        
        const chapter = await Chapter.findOne({chapterID:lesson.chapterID}).lean()
        if (!chapter) return next({status:404,msg:'chapter not found'})
    
        const course = await Course.findOne({courseID:chapter.courseID}).lean()
        if (!course) return next({status:404,msg:'course not found'})
    
        lobj.name       = name      ? name      : lobj.name
        lobj.desc       = desc      ? desc      : lobj.desc
        lobj.lessonID   = lessonID  ? lessonID  : lobj.lessonID
        lobj.order      = order     ? order     : lobj.order
        lobj.frames     = frames    ? frames    : lobj.frames
        lobj.code       = code      ? code      : lobj.code

        const [err,result] = await tojs(lobj.save())

        if (err) arrayOfErrors.push(err)

    }

    if (!arrayOfErrors.isEmpty) return next({status:500,msg:'faild',error:arrayOfErrors})

    res.payload = {msg:'successful'}

    return next();
});
router.post('/delete',[auth,isProfessor],async(req,res,next)=>{
    const schema  = Joi.object({

        lobjID:     Joi.string().required(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {lobjID} = req.body

    const lobj = await Lobj.findOneAndDelete({lobjID})
    if (!lobj) return next({status:404,msg:'lobj not found'})

    res.payload = 'successful'
    return next()
});
router.post('/full',[auth],async(req,res,next)=>{
    const schema  = Joi.object({
        
        lessonID:   Joi.string().required(),

        token:      Joi.any().optional().allow('',null)
    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {lessonID} = req.body

    let query = {lessonID}

    let [err,result] = await tojs(Lobj.find(query).lean())

    let full = await Promise.all(
        result.map(async lobj => {
            lobj.frames = await Frame.find({lobjID:lobj.lobjID}).select('-id -_id -__v -createdAt -updatedAt').lean();
            return lobj
        })
    )

    res.payload = full
    
    return next();
});
router.post('/complete',[auth],async(req,res,next)=>{
    const schema  = Joi.object({
        
        lobjID:     Joi.string().required(),

        token:      Joi.any().optional().allow('',null)
    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {lobjID} = req.body

    let query = {lobjID}

    let [err,result] = await tojs(Lobj.find(query).lean())

    let full = await Promise.all(
        result.map(async lobj => {
            lobj.frames = await Frame.find({lobjID:lobj.lobjID}).select('-id -_id -__v -createdAt -updatedAt').lean();
            return lobj
        }),

        result.map(async lobj => {
            lobj.canvases = await Canvas.find({lobjID:lobj.lobjID}).select('-id -_id -__v -createdAt -updatedAt').lean();
            return lobj
        }),

        result.map(async lobj => {
            lobj.states = await State.find({lobjID:lobj.lobjID}).select('-id -_id -__v -createdAt -updatedAt').lean();
            return lobj
        })
    )

    res.payload = full
    
    return next();
});
router.post('/duplicate',[auth,isProfessor],async(req,res,next)=>{
    const schema  = Joi.object({

        lessonID:           Joi.string().required(),
        lobjID:             Joi.string().required(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {lobjID,lessonID} = req.body

    const lobj = await Lobj.findOne({lobjID})
    if (!lobj) return next({status:404,msg:'lobj not found'})

    if (lobj.lessonID == lessonID)
        return next({status:400,msg:'lessonID is the same as before'})
    
    const lesson = await Lesson.findOne({lessonID})
    if (!lesson) return next({status:404,msg:'lesson not found'})
    
    const [err,result] = await tojs(lobj.duplicate(lessonID))

    if (err) errorLog(err)

    res.payload = result
    return next();

});


module.exports = router;