const router            = require('express').Router()
  ,   {Annotation}      = require('../models/annotations')

  ,   Joi               = require('@hapi/joi')

  ,  {sysAdmin}         = require('../middleware/sysRoles')
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

    const [err,result] = await tojs(Lobj.find(query))

    res.payload = result
    
    return next();
});
router.post('/add',[auth],async(req,res,next)=>{

    const schema  = Joi.object({

        title:              Joi.string().required(),
        desc:               Joi.string().required(),
        lessonID:           Joi.string().required(),
        order:              Joi.number().required(),
        startDate:          Joi.string().optional().allow(null,''),

        token:              Joi.any().allow(null,'').optional(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {title,desc,lessonID,order,startDate} = req.body

    const lesson = await Lesson.findOne({lessonID})
    if (!lesson) return next({status:404,msg:'lesson not found'})

    const chapter = await Chapter.findOne({chapterID:lesson.chapterID})
    if (!chapter) return next({status:404,msg:'chapter not found'})

    const course = await Course.findOne({courseID:chapter.courseID})
    if (!course) return next({status:404,msg:'course not found'})

    const lobj = new Lobj({
        title,
        desc,
        order,
        startDate,
        lessonID,
        chapterID:  chapter.chapterID,
        courseID:   course.courseID,
    })

    const [err,result] = await tojs(lobj.save())

    if (err) return next({status:500,msg:'faild',error:err})

    res.payload = result

    return next();
});
router.post('/update',[auth],async(req,res,next)=>{

    const schema  = Joi.array().items(
    
        Joi.object({

            lessonID:           Joi.string().required(),
            title:              Joi.string().required(),
            desc:               Joi.string().required(),
            lobjID:             Joi.string().required(),
            order:              Joi.number().required(),
            startDate:          Joi.string().optional().allow(null,''),

            token:              Joi.any().allow(null,'').optional(),

        })
    )
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    let arrayOfErrors = []

    for (item of req.body){

        const {lessonID,title,desc,lobjID,order,startDate} = item

        const lobj = await Lobj.findOne({lobjID})
        if (!lobj) return next({status:404,msg:'lobj not found'})
    
        const lesson = await Lesson.findOne({lessonID:lobj.lessonID}).lean()
        if (!lesson) return next({status:404,msg:'lesson not found'})
        
        const chapter = await Chapter.findOne({chapterID:lesson.chapterID}).lean()
        if (!chapter) return next({status:404,msg:'chapter not found'})
    
        const course = await Course.findOne({courseID:chapter.courseID}).lean()
        if (!course) return next({status:404,msg:'course not found'})
    
        lobj.title      = title     ? title     : lobj.title
        lobj.desc       = desc      ? desc      : lobj.desc
        lobj.lessonID   = lessonID  ? lessonID  : lobj.lessonID
        lobj.order      = order     ? order     : lobj.order
        lobj.startDate  = startDate ? startDate : lobj.startDate

        const [err,result] = await tojs(lobj.save())

        if (err) arrayOfErrors.push(err)

    }

    if (!arrayOfErrors.isEmpty) return next({status:500,msg:'faild',error:arrayOfErrors})

    res.payload = {msg:'successful'}

    return next();
});
router.post('/delete',[auth],async(req,res,next)=>{
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

module.exports = router;