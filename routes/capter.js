const router                    = require('express').Router()
  ,   {Chapter}                 = require('../models/chapter')
  ,   {Course}                  = require('../models/courses')

  ,   Joi                       = require('@hapi/joi')

  ,   {sysAdmin}                = require('../middleware/sysRoles')
  ,   auth                      = require('../middleware/auth')

router.post('/list',async(req,res,next)=>{
    const schema  = Joi.object({

        // title:      Joi.string().required(),
        // desc:       Joi.string().required(),
        // startDate:  Joi.date()  .required(),
        // order:      Joi.number().required(),
        // courseID:   Joi.string().required(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {title,desc,startDate,order,courseID} = req.body

    const [err,result] = await tojs(Course.find())

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

    const {title,desc,startDate,order,courseID,} = req.body

    const course = await Course.find({courseID})
    if (!course) return next({msg:'course not found'})

    const chapter = new Chapter({title,univsersity,professor})

    const [err,result] = await tojs(chapter.save())

    if (err) return next({msg:'Error',error:err})

    res.payload = result

    return next();
});
router.post('/update',[auth],async(req,res,next)=>{
    const schema  = Joi.object({

        _id:        Joi.string().required(),
        title:      Joi.string().required(),
        desc:       Joi.string().required(),
        startDate:  Joi.date()  .optional(),
        order:      Joi.number().required(),
        courseID:   Joi.string().required(),
    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {courseID,title,univsersity,professor} = req.body

    const course = await courseID.find({courseID})
    if (!course) return next({msg:'course not found'})

    const prof = await User.find({userID,role:'professor'})
    if (!prof) return next({msg:'professor not found'})

    course.title       = title       ? title       : course.title
    course.professor   = professor   ? professor   : course.professor
    course.univsersity = univsersity ? univsersity : course.univsersity

    const [err,result] = await tojs(course.save({}))

    if (err) errorLog(err)

    res.payload = result
    
    return next();
});
router.post('/delete',[auth],async(req,res,next)=>{
    const schema  = Joi.object({

        courseID:       Joi.string().required(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {courseID} = req.body

    const course = await courseID.findOneAndDelete({courseID})
    if (!course) return next({msg:'course not found'})

    res.payload = 'course deleted successfully'
    return next()
});
module.exports = router;


