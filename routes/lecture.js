const router                    = require('express').Router()
  ,   {Lecture}                  = require('../models/lecture')

  ,   Joi                       = require('@hapi/joi')

  ,  {sysAdmin}                 = require('../middleware/sysRoles')
  ,   auth                      = require('../middleware/auth')

router.post('/list',async(req,res,next)=>{
    const schema  = Joi.object({

        title:          Joi.string().optional(),
        univsersity:    Joi.string().optional(),
        professor:      Joi.string().optional(),

    })
    const {error} = schema.validate(req.body,{abortEarly:false});
    if (error) return next({status:400,msg:error.details.map(x=>x.message)});

    const {title,univsersity,professor} = req.body

    query = {}

    if (title)          query = {...query,title}
    if (univsersity)    query = {...query,univsersity}
    if (professor)      query = {...query,professor}

    console.log(query)

    const [err,result] = await tojs(Course.find({}))

    if (err) errorLog(err)

    res.payload = result
    
    return next();
});
router.post('/add',[auth,sysAdmin],async(req,res,next)=>{
    const schema  = Joi.object({

        title:          Joi.string().required(),
        univsersity:    Joi.string().required(),
        professor:      Joi.string().required(),

    })
    const {error} = schema.validate(req.body,{abortEarly:false});
    if (error) return next({status:400,msg:error.details.map(x=>x.message)});

    const {title,univsersity,professor} = req.body

    const prof = await User.find({userID,role:'professor'})
    if (!prof) return next({msg:'professor not found'})

    const course = new Course({title,univsersity,professor})

    const [err,result] = await tojs(course.save({}))

    if (err) errorLog(err)

    res.payload = result

    return next();
});
router.post('/update',[auth,sysAdmin],async(req,res,next)=>{
    const schema  = Joi.object({

        courseID:       Joi.string().required(),
        title:          Joi.string().optional(),
        univsersity:    Joi.string().optional(),
        professor:      Joi.string().optional(),

    })
    const {error} = schema.validate(req.body,{abortEarly:false});
    if (error) return next({status:400,msg:error.details.map(x=>x.message)});

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
router.post('/delete',[auth,sysAdmin],async(req,res,next)=>{
    const schema  = Joi.object({

        courseID:       Joi.string().required(),

    })
    const {error} = schema.validate(req.body,{abortEarly:false});
    if (error) return next({status:400,msg:error.details.map(x=>x.message)});

    const {courseID} = req.body

    const course = await courseID.findOneAndDelete({courseID})
    if (!course) return next({msg:'course not found'})

    res.payload = 'course deleted successfully'
    return next()
});
module.exports = router;
