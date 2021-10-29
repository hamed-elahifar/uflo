const router            = require('express').Router()
  ,   {Chapter}         = require('../models/chapter')
  ,   {Course}          = require('../models/courses')
  ,   {Lesson}          = require('../models/lessons')

  ,   Joi               = require('joi')

  ,  {sysAdmin,isProfessor,isTA}
                        = require('../middleware/sysRoles')
  ,   auth              = require('../middleware/auth')

router.post('/list',[auth],async(req,res,next)=>{
    const schema  = Joi.object({
        
        chapterID:   Joi.string().required(),

        token:      Joi.any().optional().allow('',null)
    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {chapterID} = req.body

    let query = {chapterID}

    const [err,result] = await tojs(Lesson.find(query).select('-id -_id -__v -createdAt -updatedAt'))

    res.payload = result
    
    return next();
});
router.post('/add',[auth,isProfessor],async(req,res,next)=>{

    const schema  = Joi.object({

        title:              Joi.string().required(),
        desc:               Joi.string().required(),
        chapterID:          Joi.string().required(),
        order:              Joi.number().required(),
        // startDate:          Joi.string().optional().allow(null,''),

        token:              Joi.any().allow(null,'').optional(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {title,desc,chapterID,order} = req.body

    const chapter = await Chapter.findOne({chapterID})
    if (!chapter) return next({status:404,msg:'chapter not found'})

    const course = await Course.findOne({courseID:chapter.courseID})
    if (!course) return next({status:404,msg:'course not found'})

    const lesson = new Lesson({title,desc,chapterID,order,courseID:course.courseID})

    const [err,result] = await tojs(lesson.save())

    if (err) return next({status:500,msg:'faild',error:err})

    res.payload = result

    return next();
});
router.post('/update',[auth,isTA],async(req,res,next)=>{

    const schema  = Joi.array().items(
    
        Joi.object({

            lessonID:           Joi.string().required(),
            title:              Joi.string().required(),
            desc:               Joi.string().required(),
            chapterID:          Joi.string().required(),
            order:              Joi.number().required(),
            // startDate:          Joi.string().optional().allow(null,''),

            token:              Joi.any().allow(null,'').optional(),

        })
    )
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    let arrayOfErrors = []

    for (item of req.body){

        const {lessonID,title,desc,chapterID,order} = item
    
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

        const [err,result] = await tojs(lesson.save())

        if (err) arrayOfErrors.push(err)

    }

    if (!arrayOfErrors.isEmpty) return next({status:500,msg:'faild',error:arrayOfErrors})

    res.payload = {msg:'successful'}

    return next();
});
router.post('/delete',[auth,isProfessor],async(req,res,next)=>{
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
router.post('/duplicate',[auth,isProfessor],async(req,res,next)=>{
    
    const schema  = Joi.object({

        chapterID:          Joi.string().required(),
        lessonID:           Joi.string().required(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {chapterID,lessonID} = req.body

    const lesson = await Lesson.findOne({lessonID})
    if (!lesson) return next({status:404,msg:'lesson not found'})

    if (lesson.chapterID == chapterID)
        return next({status:400,msg:'chapterID is the same as before'})

    const chapter = await Chapter.findOne({chapterID})
    if (!chapter) return next({status:404,msg:'chapter not found'})

    const [err,result] = await tojs(lesson.duplicate(chapterID))

    if (err) errorLog(err)

    res.payload = result
    return next();

});

// @TODO
// upload to lesson

module.exports = router;
