const router         = require('express').Router()
  ,   {User}         = require('../models/users')
  ,   {Course}       = require('../models/courses')

  ,   Joi            = require('@hapi/joi')

  ,  {sysAdmin}      = require('../middleware/sysRoles')
  ,   auth           = require('../middleware/auth')

router.post('/list',[auth],async(req,res,next)=>{
    const schema  = Joi.object({
        token:      Joi.any().allow(null,'').optional(),
        
    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    // const {} = req.body

    const [err,result] = await tojs(Course.find().select('-id -_id -__v'))

    if (err) return next({status:500,error:err})

    res.payload = result
    
    return next();
});
router.post('/add',[auth],async(req,res,next)=>{

    const schema  = Joi.object({

        name:               Joi.string().required(),
        description:        Joi.string().required(),
        professorID:        Joi.string().required(),
        startDate:          Joi.string().optional().allow(null,''),
        endDate:            Joi.string().optional().allow(null,''),
        syllabus:           Joi.string().optional().allow(null,''),

        token:              Joi.any().allow(null,'').optional(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {name,description,professorID,startDate,endDate,syllabus} = req.body

    const prof = await User.findOne({userID:professorID,role:'professor'})
    if (!prof) return next({msg:'professor not found'})

    const course = new Course({name,description,professorID,startDate,endDate,syllabus})

    const [err,result] = await tojs(course.save())

    if (err) return next({status:500,error:err})

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
router.post('/delete',[auth,sysAdmin],async(req,res,next)=>{
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
