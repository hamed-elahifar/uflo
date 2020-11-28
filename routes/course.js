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

    if (err) return next({status:500,msg:'Error',error:err})

    res.payload = result
    
    return next();
});
router.post('/add',[auth],async(req,res,next)=>{

    const schema  = Joi.object({

        title:              Joi.string().required(),
        desc:               Joi.string().required(),
        professorID:        Joi.string().required(),
        startDate:          Joi.string().optional().allow(null,''),
        endDate:            Joi.string().optional().allow(null,''),
        syllabus:           Joi.string().optional().allow(null,''),

        token:              Joi.any().allow(null,'').optional(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {title,desc,professorID,startDate,endDate,syllabus} = req.body

    const prof = await User.findOne({userID:professorID,role:'professor'})
    if (!prof) return next({msg:'professor not found'})

    const course = new Course({title,desc,professorID,startDate,endDate,syllabus})

    const [err,result] = await tojs(course.save())

    if (err) return next({status:500,error:err})

    res.payload = result

    return next();
});
router.post('/update',[auth],async(req,res,next)=>{

    const schema  = Joi.object({

        courseID:           Joi.string().required(),
        title:              Joi.string().required(),
        desc:               Joi.string().required(),
        professorID:        Joi.string().required(),
        startDate:          Joi.string().optional().allow(null,''),
        endDate:            Joi.string().optional().allow(null,''),
        syllabus:           Joi.string().optional().allow(null,''),

        token:              Joi.any().allow(null,'').optional(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {courseID,title,desc,professorID,startDate,endDate,syllabus} = req.body

    const course = await courseID.find({courseID})
    if (!course) return next({msg:'course not found'})

    const prof = await User.findOne({userID:professorID,role:'professor'})
    if (!prof) return next({msg:'professor not found'})

    course.title           = title       != undefined ? title         : course.title
    course.desc            = desc        != undefined ? desc          : course.desc
    course.professorID     = professorID != undefined ? professorID   : course.professorID
    course.startDate       = startDate   != undefined ? startDate     : course.startDate
    course.endDate         = endDate     != undefined ? endDate       : course.endDate
    course.syllabus        = syllabus    != undefined ? syllabus      : course.syllabus
    
    const [err,result]     = await tojs(course.save())

    if (err) return next({status:500,msg:'Error',error:err})

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

    const course = await Course.findOneAndDelete({courseID})
    if (!course) return next({msg:'course not found'})

    res.payload = 'course deleted successfully'
    return next()
});
router.post('/register-student',[auth],async(req,res,next)=>{
    const schema  = Joi.object({

        passcode:       Joi.string().required(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {passcode} = req.body

    const course = await Course.findOne({passcode})
    if (!course) return next({status:404,msg:'course not found'})

    const user = await User.findOne({userID:req.userinfo.userID})
    console.assert(!user,'in this line user must exist but it is not.')

    user.courses.push(course.courseID);

    user.save().then(()=>{
        return res.payload = {status:201,msg:`you successfully register at "${course.title}" course`}
    }).catch(()=>{
        return res.payload = {status:500,msg:'faild'}
    });



})


module.exports = router;
