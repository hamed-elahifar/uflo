const { ConsoleTransportOptions } = require('winston/lib/winston/transports');

const router         = require('express').Router()
  ,   {User}         = require('../models/users')
  ,   {Course}       = require('../models/courses')

  ,   Joi            = require('@hapi/joi')
  ,   multer         = require('multer')
  ,   path           = require('path')
  ,   fs             = require('fs')
  
  ,  {sysAdmin}      = require('../middleware/sysRoles')
  ,   auth           = require('../middleware/auth')

router.post('/list',[auth],async(req,res,next)=>{
    const schema  = Joi.object({

        courseID:   Joi.string().optional().allow('',null),
        
        token:      Joi.any().allow(null,'').optional(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    let query = {}

    const {courseID} = req.body

    if (courseID) query = {...query,courseID}

    const [err,result] = await tojs(Course.find(query).select('-id -_id -__v +passcode').populate(['TA','professor']))

    if (err) return next({status:500,msg:'Error',error:err})

    res.payload = result
    
    return next();
});
router.post('/students',[auth],async(req,res,next)=>{
    const schema  = Joi.object({

        courseID:       Joi.string().required(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {courseID} = req.body

    const students = await User.find({courseIDs:courseID})

    res.payload = students
    
    return next();
});
router.post('/files',[auth],async(req,res,next)=>{
    const schema  = Joi.object({

        courseID:       Joi.string().required(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {courseID} = req.body

  const directory = path.join(__dirname, '..', 'upload', courseID)
    if (!fs.existsSync(directory)) {
      res.payload = []
      return next()
    }
    
    const formatFilePath = (file) => ({
      name: file,
      path: `${req.protocol}://${req.get('host')}/${courseID}/${encodeURIComponent(file)}`
    })

    fs.readdir(directory, (err, files) => {
      res.payload = files.map(formatFilePath)
      return next();
    });

    
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

    const prof = await User.findOne({userID:professorID}) //,role:'professor'
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

    const course = await Course.findOne({courseID})
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

    const dir = path.join('upload',courseID)
    fs.rmdir(dir,{recursive:true}, (err) => {
        if (err) errorLog(err)
    });

    const students = await User.find({courseIDs:courseID})

    for (student of students) {
        User.updateOne(
            {userID:student.userID},
            {$pull:{courseIDs:courseID}}
        )
        .then ()
        .catch()
    }

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

    const [err,result] = await tojs(User.updateOne(
        {userID:req.user.userID},
        {$addToSet:{courseIDs:course.courseID}}
    ))

    if (err) return next({status:500,msg:'faild'})

    res.payload = {status:201,msg:`you successfully register at "${course.title}" course`}

    return next();

})
router.post('/add-ta',[auth],async(req,res,next)=>{
    const schema  = Joi.object({

        TAEmail:    Joi.string().required(),
        courseID:   Joi.string().required(),

        token:      Joi.any().allow(null,'').optional(),  
    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {TAEmail,courseID} = req.body

    const course = await Course.findOne({courseID})
    if (!course) return next({msg:'course not found'})

    const ta = await User.findOne({email:TAEmail})
    if (!ta) return next({msg:'TA not found'})

    const [err,result] = await tojs(Course.updateOne(
        {courseID},
        {$addToSet:{TAIDs:ta.userID}}
    ))

    if (err) return next({status:500,msg:'faild'})

    res.payload = {status:201,msg:`User ${ta.firstname} ${ta.lastname} added to ${course.title}`}

    return next();

})
router.post('/remove-ta',[auth],async(req,res,next)=>{
    const schema  = Joi.object({

        TAEmail:    Joi.string().required(),
        courseID:   Joi.string().required(),

        token:      Joi.any().allow(null,'').optional(),  
    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {TAEmail,courseID} = req.body

    const course = await Course.findOne({courseID})
    if (!course) return next({msg:'course not found'})

    const ta = await User.findOne({email:TAEmail})
    if (!ta) return next({msg:'TA not found'})

    if (course.TAIDs.includes(ta.userID)){
        const [err,result] = await tojs(Course.updateOne(
            {courseID},
            {$pull:{TAIDs:ta.userID}}
        ))

        if (err) return next({status:500,msg:'faild',error:err})
    
        res.payload = {status:201,msg:`User ${ta.firstname} ${ta.lastname} removed from ${course.title}`}

    } else {

        res.payload = {msg:`User ${ta.firstname} ${ta.lastname} not found in ${course.title} TA`}

    }

    return next();

})
const storage     = multer.diskStorage({
    destination:    (req,file,cb)=>{cb(null,'upload')},
    filename:       (req,file,cb)=>{cb(null, file.originalname)}
});
const fileFilter  = (req,file,cb) => {cb(null, true)}
const limits      = {files: 10,fileSize: 20 * 1024 * 1024};// 20MB
const upload      = multer({storage,fileFilter,limits}).array('upload',10);

router.post('/upload/:courseID',[auth],async(req,res)=>{

    const course = await Course.findOne({courseID:req.params.courseID})
    if (!course) return next({status:404,msg:'course not found'})


    // Note: If there's an error like [Error: ENOENT: no such file or directory, upload/FILENAME]
    // Go ahead and create an empty directory upload/ under project root dir

    upload(req,res,(err) => {

        if (!req.files) return res.status(500).json({msg:'no file uploaded'})
        
        if (err)        return res.status(500).json({msg:'upload failed',error:err});
        
        const directory = path.join(__dirname,'..','upload',req.params.courseID)
        if (!fs.existsSync(directory)){fs.mkdirSync(directory)}

        // Move files from ./upload to ./upload/courseID
        for (file of req.files){
            // console.log(file)
            fs.rename(path.join(__dirname,'..','upload',file.filename),
                      path.join(__dirname,'..','upload',req.params.courseID,file.filename), 
                      (err) => {
                        if (err) return next({status:400,msg:`error on moving file "${file.filename}"`,error:err})
                      }
            )
        }

        // update path
        for (file of req.files){
            file.path = path.join('upload',req.params.courseID,file.filename)
        }
        res.json(req.files);
    });
});

module.exports = router;
