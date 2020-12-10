const router                    = require('express').Router()
  ,   {Chapter}                 = require('../models/chapter')
  ,   {Course}                  = require('../models/courses')

  ,   Joi                       = require('@hapi/joi')

  ,   {sysAdmin}                = require('../middleware/sysRoles')
  ,   auth                      = require('../middleware/auth')

router.post('/list',async(req,res,next)=>{
    const schema  = Joi.object({

        courseID:   Joi.string().required(),

        token:      Joi.any().optional().allow('',null)

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {courseID} = req.body

    let query = {courseID}

    const [err,result] = await tojs(Chapter.find(query))

    if (err) return next({status:500,msg:'Error',error:err})

    res.payload = result
    
    return next();
});
router.post('/add',[auth],async(req,res,next)=>{
    const schema  = Joi.object({

        title:      Joi.string().required(),
        desc:       Joi.string().required(),
        startDate:  Joi.date()  .optional(),
        order:      Joi.number().required(),
        courseID:   Joi.string().required(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {title,desc,startDate,order,courseID} = req.body

    const course = await Course.findOne({courseID})
    if (!course) return next({status:404,msg:'course not found'})

    const chapter = new Chapter({title,desc,startDate,order,courseID})

    const [err,result] = await tojs(chapter.save())

    if (err) return next({msg:'Error',error:err})

    res.payload = result

    return next();
});
router.post('/update',[auth],async(req,res,next)=>{
    const schema  = Joi.array().items(
        Joi.object({
    
            chapterID:  Joi.string().required(),
            title:      Joi.string().required(),
            desc:       Joi.string().required(),
            startDate:  Joi.date()  .optional(),
            order:      Joi.number().required(),
            courseID:   Joi.string().required(),
    
        })
    )
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    let arrayOfErrors = []

    for (item of req.body){
        const {chapterID,title,desc,startDate,order,courseID} = item

        const chapter = await Chapter.findOne({chapterID})
        if (!chapter) return next({msg:'chapter not found'})
    
        chapter.title       = title       ? title       : chapter.title
        chapter.desc        = desc        ? desc        : chapter.desc
        chapter.startDate   = startDate   ? startDate   : chapter.startDate
        chapter.order       = order       ? order       : chapter.order
        chapter.courseID    = courseID    ? courseID    : chapter.courseID
    
        const [err,result] = await tojs(chapter.save())

        if (err) arrayOfErrors.push(err)
    }

    if (!arrayOfErrors.isEmpty) return next({status:500,msg:'faild',error:arrayOfErrors})

    res.payload = {msg:'successful'}
    
    return next();
});
router.post('/delete',[auth],async(req,res,next)=>{
    const schema  = Joi.object({

        chapterID:       Joi.string().required(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {chapterID} = req.body

    const chapter = await Chapter.findOneAndDelete({chapterID})
    if (!chapter) return next({msg:'chapter not found'})

    res.payload = 'chapter deleted successfully'
    return next()
});
module.exports = router;


