const router                    = require('express').Router()
  ,   {User}                    = require('../models/users')

//   ,   {mongoDB}                 = require('../startup/mongodb')

//   ,  {sendEmail}                = require('../services/email')
  ,   Joi                       = require('@hapi/joi')

  ,  {sysAdmin}                 = require('../middleware/sysRoles')
  ,   auth                      = require('../middleware/auth')

router.all('/me',[auth],async(req,res,next)=>{
    res.payload = req.user;
    return next();
})
router.post('/add',[auth,sysAdmin],async(req,res,next)=>{
    const schema  = Joi.object({
        username:                   Joi.string().required().min(3),
                                    //    .regex(/^[a-zA-Z0-9_.]*$/)
                                    //    .messages({'string.pattern.base':'invalid character(s) in username field'}),

        password:                   Joi.string().required()
                                       .regex(new RegExp(getConfig('passwordComplexity')))
                                       .messages({'string.pattern.base': 'password does not meet minimum complexity'}),
                                       
	    firstName:                  Joi.string() .allow(null,'').optional(),
	    lastName:                   Joi.string() .allow(null,'').optional(),
        mobile:                     Joi.string() .allow(null,'').optional(),
        email:                      Joi.string() .allow(null,'').optional(),
        enabled:                    Joi.boolean().allow(null,'').optional(),
        isSysAdmin:                 Joi.boolean().allow(null,'').optional(),

        token:                      Joi.any().allow(null,'').optional(),
    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    let {username,password,firstName,lastName,
        mobile,enabled,
        email,isSysAdmin} = req.body

    // find User
    let user = await User.findOne({username});
    if (user) return next({status:409,msg:'user already exist'});
        
    user = new User({
        username,password,firstName,lastName,
        email,isSysAdmin,
        active:true,enabled:true,
    });

    const [err,result] = await tojs(user.save())

    if (err) return next(err)

    result.password = undefined;
    result._id      = undefined;
    result.__v      = undefined;

    res.payload = result
    return next();
});
router.post('/get-userinfo',[auth,sysAdmin],async(req,res,next)=>{
    
    const schema  = Joi.object({
        userID:         Joi.string().required(), 

        token:          Joi.any().allow(null,'').optional(),
    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    let {userID} = req.body

    const user = await User.findOne({userID})
                           .select('-_id -__v')
                           .lean()

    if (!user) return next({status:404,msg:'user not found'});

    res.payload = user

    return next();
});
router.post('/get-myinfo',[auth],async(req,res,next)=>{
    let user = await User
        .findOne({userID:req.userinfo.userID})
        // .select('')

    res.payload = user
    
    return next();
});
router.post('/edit-myinfo',[auth],async(req,res,next)=>{
    
    const schema  = Joi.object({
        name:               Joi.string().optional().allow(null,''),
	    university:         Joi.string().required(),
	    classLevel:         Joi.number().required().valid('Freshman','Sophomore','Junior','Senior'),
        major:              Joi.number().required(),

        academicPerformance:            Joi.object().keys({
            CurrentAcademicPerformance: Joi.string().required().valid('Excellent','Good','Average','Below Average'),
            DesiredAcademicPerformance: Joi.string().required().valid('Excellent','Good','Average','Below Average')
        }).required(),

        examTakingPerformance:          Joi.object().keys({
            ExamType:                   Joi.string().required().valid('Analytical','Memorization'),
            QuestionType:               Joi.string().required().valid('Multiple Choice','Free Response'),
        }).required(),

        learningHabits:             Joi.object().keys({
            ProcrastinationLevel:   Joi.string().required().valid('High','Medium','Low'),
            LearningType:           Joi.string().required().valid('Visual','Verbal/Auditory','Kinesthetic','Reading/Writing'),
        }).required(),
    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {name,university,classLevel,major,
        academicPerformance,examTakingPerformance,learningHabits} = req.body

    let [err,user] = await tojs(User.findOne({userID:req.user.userID}))

    if (!user) return next({msg:'user not found'})
    if (err)   return next({msg:'there is an error on fetching data from database'})

    user.name                   = name != undefined ? name    : user.name
    user.university             = university
    user.classLevel             = classLevel
    user.major                  = major
    user.academicPerformance    = academicPerformance    
    user.examTakingPerformance  = examTakingPerformance
    user.learningHabits         = learningHabits

    let [Err,result] = await tojs(user.save())

    res.payload = result;

    return next();
});
router.post('/edit-userinfo',[auth,sysAdmin],async(req,res,next)=>{
    const schema  = Joi.object({
        userID:                    Joi.any()    .allow(null,'').required(),
	    firstName:                  Joi.string() .allow(null,'').optional(),
	    lastName:                   Joi.string() .allow(null,'').optional(),
	    mobile:                     Joi.number() .allow(null,'').optional(),
	    tel:                        Joi.string() .allow(null,'').optional(),
	    active:                     Joi.boolean().allow(null,'').optional(),
        enabled:                    Joi.boolean().allow(null,'').optional(),
        IDNumber:                   Joi.string() .allow(null,'').optional(),
        email:                      Joi.string() .allow(null,'').optional(),
        birthDate:                  Joi.string() .allow(null,'').optional(),
        isSysAdmin:                 Joi.boolean().allow(null,'').optional(),
        mustChangePassword:         Joi.boolean().allow(null,'').optional(),

        token:                      Joi.any().allow(null,'').optional(),
    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    let {userID,firstName,lastName,mobile,tel,active,enabled,
        email,birthDate,isSysAdmin,
        mustChangePassword} = req.body

    const user = await User.findOne({userID})
    if (!user) return next({msg:'user not found'})

    user.firstName                = firstName                != undefined ?      firstName                 : user.firstName  
    user.lastName                 = lastName                 != undefined ?      lastName                  : user.lastName  
    user.mobile                   = mobile                   != undefined ?      mobile                    : user.mobile  
    user.tel                      = tel                      != undefined ?      tel                       : user.tel  
    user.active                   = active                   != undefined ? eval(active)                   : user.active  
    user.enabled                  = enabled                  != undefined ? eval(enabled)                  : user.enabled  
    user.email                    = email                    != undefined ?      email                     : user.email  
    user.birthDate                = birthDate                != undefined ?      birthDate                 : user.birthDate  
    user.address                  = address                  != undefined ?      address                   : user.address  
    user.isSysAdmin               = isSysAdmin               != undefined ? eval(isSysAdmin)               : user.isSysAdmin  
    user.mustChangePassword       = mustChangePassword       != undefined ? eval(mustChangePassword)       : user.mustChangePassword  
     
    // @TODO 
    if (user.enabled) {
        user.active             = true
        user.incorrectPassCount = 0;
    }

    const [err,result] = await tojs(user.save())

    if(err) next({msg:'there was an error in operation'})
    
    res.payload = result

    return next();
});
router.post('/list',[auth],async(req,res,next)=>{
    
    const schema  = Joi.object({
        search:     Joi.string() .optional().allow(null,''),

        from:       Joi.number() .optional().allow(null,'').positive().integer(),
        to:         Joi.number() .optional().allow(null,'').positive().integer(),
        token:      Joi.any().allow(null,'').optional(),
    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    let {search}    = req.body
    let {from,to}   = req.body

    // from = +from || 1 ;
    // to   = +to   || 20;

    let query = {}

    if (search){
        query = {$and:[query,
            {$or:[
                {username:  new RegExp(search,'i')},
                {firstName: new RegExp(search,'i')},
                {lastName:  new RegExp(search,'i')},
                {email:     new RegExp(search,'i')},
                {IDNumber:  new RegExp(search,'i')},
            ]}
        ]}
    }
    
    let list =  await User.find (query)
                     .select('-_id -__v')
                     .skip (    +from-1)
                     .limit(+to-+from+1 || null)
                     .lean()

    let total = await User.find (query)
                     .countDocuments()
                     .lean()

    res.payload = {list,total};
    return next()
});
router.post('/delete',[auth,sysAdmin],async(req,res,next)=>{
    const schema  = Joi.object({
        userID:     Joi.string().required(),

        token:      Joi.any().allow(null,'').optional(),
    })
    const {error:joiErr} = schema.validate(req.body,{abortEarly:false});
    if (joiErr) return next({status:400,msg:joiErr.details.map(x=>x.message)});

    const {userID} = req.body

    let user = await User.findOne({userID})
    if (!user) return next({status:404,msg:'user not found'});

    if (user.deleted == null){
        user = await User.findOneAndUpdate({userID:req.body.userID},{$set:{deleted:Date.now()}});
        res.payload = {status:'success',status:200,msg:'operation successful'}
    }
    if (user.deleted != null){
        user = await User.findOneAndUpdate({userID:req.body.userID},{$set:{deleted:null}});
        res.payload = {status:'success',status:200,msg:'recover successful'}
    }

    return next();
});

module.exports = router;
