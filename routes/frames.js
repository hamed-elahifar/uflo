const router            = require('express').Router()
  ,   {Course}          = require('../models/courses')
  ,   {Chapter}         = require('../models/chapter')
  ,   {Lesson}          = require('../models/lessons')
  ,   {Lobj}            = require('../models/lobj')
  ,   {Frame}           = require('../models/frames')

  ,   Joi               = require('@hapi/joi')
  ,   multer            = require('multer')
  ,   path              = require('path')
  ,   fs                = require('fs')

  ,  {sysAdmin}         = require('../middleware/sysRoles')
  ,   auth              = require('../middleware/auth')

router.post('/list',[auth],async(req,res,next)=>{
    const schema  = Joi.object({
        
        lobjID:     Joi.string().required(),

        token:      Joi.any().optional().allow('',null)
    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {lobjID} = req.body

    let query = {lobjID}

    const [err,result] = await tojs(Frame.find(query))

    res.payload = result
    
    return next();
});
router.post('/add',[auth],async(req,res,next)=>{

    const schema  = Joi.object({

        title:              Joi.string().required(),
        desc:               Joi.string().required(),
        lobjID:             Joi.string().required(),
        order:              Joi.number().required(),
        content:            Joi.array().items(Joi.object({
            order:          Joi.number().required(),
            type:           Joi.string().valid('description','quote','definition','table','question','function'),
            html:           Joi.string().required(),
        })),
        voice:              Joi.string().optional().allow(null,''),

        token:              Joi.any().allow(null,'').optional(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {title,desc,lobjID,order,content,voice} = req.body

    const lobj = await Lobj.findOne({lobjID})
    if (!lobj) return next({status:404,msg:'lobj not found'})

    const lesson = await Lesson.findOne({lessonID:lobj.lessonID}).lean()
    if (!lesson) return next({status:404,msg:'course not found'})

    const chapter = await Chapter.findOne({chapterID:lesson.chapterID}).lean()
    if (!chapter) return next({status:404,msg:'chapter not found'})

    const course = await Course.findOne({courseID:chapter.courseID}).lean()
    if (!course) return next({status:404,msg:'course not found'})

    const frame = new Frame({
        title,
        desc,
        order,
        content,
        voice,
        lobjID:     lobj.lobjID,
        lessonID:   lesson.lessonID,
        chapterID:  chapter.chapterID,
        courseID:   course.courseID,
    })

    const [err,result] = await tojs(frame.save())

    if (err) return next({status:500,msg:'faild',error:err})

    res.payload = result

    return next();
});
router.post('/update',[auth],async(req,res,next)=>{

    const schema  = Joi.array().items(
    
        Joi.object({

            title:              Joi.string().required(),
            desc:               Joi.string().required(),
            frameID:             Joi.string().required(),
            order:              Joi.number().required(),
            content:            Joi.array().items(Joi.object({
                order:          Joi.number().required(),
                type:           Joi.string().valid('description','quote','definition','table','question'),
                html:           Joi.string().required(),
            })),
            voice:              Joi.string().optional().allow(null,''),


        token:              Joi.any().allow(null,'').optional(),

        })
    )
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    let arrayOfErrors = []

    for (item of req.body){

        const {frameID,title,desc,order,content,voice} = item

        const frame = await Frame.findOne({frameID})
        if (!frame) return next({status:404,msg:'lobj not found'})

        const lobj = await Lobj.findOne({lobjID:frame.lobjID})
        if (!lobj) return next({status:404,msg:'lobj not found'})
    
        const lesson = await Lesson.findOne({lessonID:lobj.lessonID})
        if (!lesson) return next({status:404,msg:'lesson not found'})
        
        const chapter = await Chapter.findOne({chapterID:lesson.chapterID})
        if (!chapter) return next({status:404,msg:'chapter not found'})
    
        const course = await Course.findOne({courseID:chapter.courseID})
        if (!course) return next({status:404,msg:'course not found'})
    
        frame.title      = title     ? title     : frame.title
        frame.desc       = desc      ? desc      : frame.desc
        frame.order      = order     ? order     : frame.order
        frame.content    = content   ? content   : frame.content
        frame.voice      = voice     ? voice     : frame.voice

        const [err,result] = await tojs(frame.save())

        if (err) arrayOfErrors.push(err)

    }

    if (!arrayOfErrors.isEmpty) return next({status:500,msg:'faild',error:arrayOfErrors})

    res.payload = {msg:'successful'}

    return next();
});
router.post('/delete',[auth],async(req,res,next)=>{
    const schema  = Joi.object({

        frameID:     Joi.string().required(),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {frameID} = req.body

    const frame = await Frame.findOneAndDelete({frameID})
    if (!frame) return next({status:404,msg:'frame not found'})

    res.payload = {msg:'successful'}
    return next()
});

const storage = multer.diskStorage({
    destination:    (req,file,cb)=>{cb(null,'upload')},
    filename:       (req,file,cb)=>{cb(null, file.originalname)}
});
const fileFilter  = (req,file,cb) => {cb(null, true)}
const limits      = {files: 1,fileSize: 20 * 1024 * 1024};// 20MB
const upload      = multer({storage,fileFilter,limits}).array('upload',1);

router.post('/upload/:frameID',[auth],async(req,res)=>{

    const frame = await Frame.findOne({frameID:req.params.frameID})
    if (!frame) return next({status:404,msg:'frame not found'})

    upload(req,res,(err) => {

        if (!req.files) return res.status(500).json({msg:'no file uploaded'})
        if (err)        return res.status(500).json({msg:'upload failed',error:err});
        
        let directory = path.join(__dirname,'..','upload',frame.courseID)
        if (!fs.existsSync(directory)){fs.mkdirSync(directory)}

            directory = path.join(__dirname,'..','upload',frame.courseID,'voice')
        if (!fs.existsSync(directory)){fs.mkdirSync(directory)}

        // Move files from ./upload to ./upload/courseID
        for (file of req.files){
            // console.log(file)
            fs.rename(path.join(__dirname,'..','upload',file.filename),
                      path.join(__dirname,'..','upload',frame.courseID,'voice',file.filename), 
                      (err) => {
                        if (err) return next({status:400,msg:`error on moving file "${file.filename}"`,error:err})
                      }
            )
        }
        // update path
        for (file of req.files){
            file.path = path.join('upload',frame.courseID,'voice',file.filename)
        }
        res.json(req.files);
    });
});

module.exports = router;




