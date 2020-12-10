const router            = require('express').Router()
  ,   {Chapter}         = require('../models/chapter')
  ,   {Course}          = require('../models/courses')
  ,   {Lesson}          = require('../models/lessons')

  ,   Joi               = require('@hapi/joi')

  ,  {sysAdmin}         = require('../middleware/sysRoles')
  ,   auth              = require('../middleware/auth')

router.post('/list',async(req,res,next)=>{
    const schema  = Joi.object({
        
        chapterID:   Joi.string().optional(),

        token:      Joi.any().optional().allow('',null)
    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {chapterID} = req.body

    let query = {}

    if (chapterID) query = {...query,chapterID}

    const [err,result] = await tojs(Lesson.find(query))

    res.payload = result
    
    return next();
});
router.post('/add',[auth],async(req,res,next)=>{

    const schema  = Joi.object({

        title:              Joi.string().required(),
        desc:               Joi.string().required(),
        chapterID:          Joi.string().required(),
        order:              Joi.number().required(),
        startDate:          Joi.string().optional().allow(null,''),

        token:              Joi.any().allow(null,'').optional(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {title,desc,chapterID,order,startDate} = req.body

    const chapter = await Chapter.findOne({chapterID})
    if (!chapter) return next({status:404,msg:'chapter not found'})

    const course = await Course.findOne({courseID:chapter.courseID})
    if (!course) return next({status:404,msg:'course not found'})

    const lesson = new Lesson({title,desc,chapterID,order,startDate,courseID:course.courseID})

    const [err,result] = await tojs(lesson.save())

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
            chapterID:          Joi.string().required(),
            order:              Joi.number().required(),
            startDate:          Joi.string().optional().allow(null,''),

            token:              Joi.any().allow(null,'').optional(),

        })
    )
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    let arrayOfErrors = []

    for (item of req.body){

        const {lessonID,title,desc,chapterID,order,startDate} = item
    
        const lesson = await Lesson.findOne({lessonID})
        if (!lesson) return next({status:404,msg:'lesson not found'})
        
        const chapter = await Chapter.findOne({chapterID})
        if (!chapter) return next({status:404,msg:'chapter not found'})
    
        const course = await Course.findOne({courseID:chapter.courseID})
        if (!course) return next({status:404,msg:'course not found'})
    
        lesson.title      = title     ? title     : lesson.title
        lesson.desc       = desc      ? desc      : lesson.desc
        lesson.chapterID  = chapterID ? chapterID : lesson.chapterID
        lesson.order      = order     ? order     : lesson.order
        lesson.startDate  = startDate ? startDate : lesson.startDate

        const [err,result] = await tojs(lesson.save())

        if (err) arrayOfErrors.push(err)

    }

    if (!arrayOfErrors.isEmpty) return next({status:500,msg:'faild',error:arrayOfErrors})

    res.payload = {msg:'successful'}

    return next();
});
router.post('/delete',[auth],async(req,res,next)=>{
    const schema  = Joi.object({

        lessonID:       Joi.string().required(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {lessonID} = req.body

    const lesson = await Lesson.findOneAndDelete({lessonID})
    if (!lesson) return next({status:404,msg:'lesson not found'})

    res.payload = 'lesson deleted successfully'
    return next()
});


module.exports = router;
