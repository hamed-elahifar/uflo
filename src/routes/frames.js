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

  ,  {sysAdmin,isProfessor,isTA}
                        = require('../middleware/sysRoles')
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
router.post('/add',[auth,isTA],async(req,res,next)=>{

    const schema  = Joi.object({

        title:              Joi.string().required(),
        frameID:            Joi.number().required(),
        frameType:          Joi.string().optional(),
        lobjID:             Joi.string().required(),
        tags:               Joi.string().optional(),
        draggables:         Joi.string().optional(),
        order:              Joi.number().optional(),

        token:              Joi.any().optional().allow(null,''),

    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {title,frameID,frameType,lobjID,tags,draggables,order} = req.body

    const lobj = await Lobj.findOne({lobjID})
    if (!lobj) return next({status:404,msg:'lobj not found'})

    // const lesson = await Lesson.findOne({lessonID:lobj.lessonID}).lean()
    // if (!lesson) return next({status:404,msg:'course not found'})

    // const chapter = await Chapter.findOne({chapterID:lesson.chapterID}).lean()
    // if (!chapter) return next({status:404,msg:'chapter not found'})

    // const course = await Course.findOne({courseID:chapter.courseID}).lean()
    // if (!course) return next({status:404,msg:'course not found'})

    const frame = new Frame({title,frameID,frameType,lobjID,tags,draggables,order})

    const [err,result] = await tojs(frame.save())

    if (err) return next({status:500,msg:'faild',error:err})

    res.payload = result

    return next();
});
router.post('/update',[auth,isTA],async(req,res,next)=>{

    const schema  = Joi.array().items(
    
        Joi.object({

            title:              Joi.string().required(),
            frameID:            Joi.number().required(),
            frameType:          Joi.string().optional(),
            lobjID:             Joi.string().required(),
            tags:               Joi.string().optional(),
            draggables:         Joi.string().optional(),
            order:              Joi.number().optional(),

            token:              Joi.any().optional().allow(null,''),

        })
    )
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    let arrayOfErrors = []

    for (item of req.body){

        const {title,frameID,frameType,lobjID,tags,draggables,order} = item

        const lobj = await Lobj.findOne({lobjID})
        if (!lobj) return next({status:404,msg:'lobj not found'})

        let frame = await Frame.findOne({frameID})

        if (!frame) {

            await Frame.create({title,frameID,frameType,lobjID,tags,draggables,order})

        } else {

            frame.title         = title         ? title         : frame.title
            frame.frameID       = frameID       ? frameID       : frame.frameID
            frame.frameType     = frameType     ? frameType     : frame.frameType
            frame.lobjID        = lobjID        ? lobjID        : frame.lobjID
            frame.tags          = tags          ? tags          : frame.tags
            frame.draggables    = draggables    ? draggables    : frame.draggables
            frame.order         = order         ? order         : frame.order
            
            const [err,result] = await tojs(frame.save())
            
            if (err) arrayOfErrors.push(err)
        }

    }

    if (!arrayOfErrors.isEmpty) return next({status:500,msg:'faild',error:arrayOfErrors})

    res.payload = {msg:'successful'}

    return next();
});
router.post('/delete',[auth,isTA],async(req,res,next)=>{
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

router.post('/upload/:frameID',[auth,isTA],async(req,res)=>{

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