const router                    = require('express').Router()
  ,   {User}                    = require('../models/users')

//   ,   {mongoDB}                 = require('../startup/mongodb')

//   ,  {sendEmail}                = require('../services/email')
  ,   bcrypt                    = require('bcryptjs')
  ,   Joi                       = require('@hapi/joi')

  ,  {sysAdmin}                 = require('../middleware/sysRoles')
  ,   auth                      = require('../middleware/auth')

router.post('/sign-up',async(req,res,next)=>{
    const schema  = Joi.object({
        username:                   Joi.string().alphanum().required().min(3),
                                        // .regex(/^[a-zA-Z_.]*$/)
                                        // .messages({'string.pattern.base':'invalid character(s) in username field'}),

        password:                   Joi.string().required(),
                                    //    .regex(new RegExp(getConfig('passwordComplexity')))
                                    //    .messages({'string.pattern.base':'password does not meet minimum complexity'}),
	    firstname:                  Joi.string().allow(null,'').required(),
	    lastname:                   Joi.string().allow(null,'').required(),
        email:                      Joi.string().email({
			                        minDomainSegments:2,
			                        tlds:{allow:['edu']}
		})                          .allow(null,'').optional().messages({'':'only .edu email is acceptable'}),
    })
    const {error} = schema.validate(req.body,{abortEarly:false});
    if (error) return next({status:400,msg:error.details.map(x=>x.message)});

    const {username,password,firstname,lastname,email} = req.body

    // find User
    let user = await User.findOne({email});
    if (user) return next({status:400,msg:'user already exist'})

    university = email.split('@')[1].split('.')
    university.pop()
    university = university.join('.')
    
    user = new User({
        username,password,firstname,lastname,email,
        university
    });

    let [err,result] = await tojs(user.save())

    if (err) return errorLog(err)

    result.password = undefined;
    result._id      = undefined;
    result.__v      = undefined;

    res.payload = result
    
    return next();
});
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
    const {error} = schema.validate(req.body,{abortEarly:false});
    if (error) return next({status:400,msg:error.details.map(x=>x.message)});

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
router.post('/login',async(req,res,next) => {
    const schema  = Joi.object({
        username:   Joi.string().required(),
        password:   Joi.string().required(),
    })
    const {error} = schema.validate(req.body,{abortEarly:false});
    if (error) return next({status:400,msg:error.details.map(x=>x.message)});

    const {username,password} = req.body

    let user   = await User.findOne({username}).select("+password");
    if (!user){
        return next({status:400,msg:'incorrect username or password'});
    }
    
    const validPassword = await user.validatePassword(password)
    if (!validPassword) {
        return next({status:400,msg:'incorrect username or password'})
    }

    if (!user.enabled || !user.active) {
        return next({status:403,msg:'disabled user account'})
    }

    if (user.mustChangePassword) {
        res.payload = {
            msg:                        'you must change your password',
            mustChangePassword:         user.mustChangePassword,
            token:                      '',
        }
        return next();
    }

    user.lastLoginDate      = Date.now();
    user.incorrectPassCount = 0;
    user.save().then().catch(err => {errorLog(err)});

    const token = user.generateAuthToken();  
    res.header('token',token);
    res.payload = res.payload ? Object.assign(res.payload,{token}) : {token}
    
    return next();
});
router.post('/logout',[auth],async(req,res,next) => {

    const schema  = Joi.object({
        token:      Joi.any()   .allow(null,'').optional(),
    })
    const {error} = schema.validate(req.body,{abortEarly:false});
    if (error) return next({status:400,msg:error.details.map(x=>x.message)});

    res.payload = {msg:'logout successful'}
    return next()
});
router.post('/get-userinfo',[auth,sysAdmin],async(req,res,next)=>{
    
    const schema  = Joi.object({
        userID:         Joi.string().required(), 

        token:          Joi.any().allow(null,'').optional(),
    })
    const {error} = schema.validate(req.body,{abortEarly:false});
    if (error) return next({status:400,msg:error.details.map(x=>x.message)});

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
router.post('/change-password',async(req,res,next)=>{
    const schema  = Joi.object({
        username:           Joi.string().required(),

        password:           Joi.string().required(),
        newPassword:        Joi.string().required()
                               .regex(new RegExp(getConfig('passwordComplexity')))
                               .messages({'string.pattern.base': 'password does not meet minimum complexity'}),

        token:              Joi.any().allow(null,'').optional(),
    })
    const {error} = schema.validate(req.body,{abortEarly:false});
    if (error) return next({status:400,msg:error.details.map(x=>x.message)});

    const {username,password,newPassword} = req.body

    let  user = await User.findOne({username}).select("+password");
    if (!user) return next({status:404,msg:'user not found'});

    if (!user.enabled || !user.active) return next({status:403,msg:'disabled user account'});

    const validPassword = await bcrypt.compare(password, user.password);
    if  (!validPassword) return next({status:400,msg:'password incorrect'})

    // same Password
    // const samePassword = (oldPassword == newPassword)
    const samePassword = await bcrypt.compare(newPassword, user.password);
    if (samePassword) return next({status:400,msg:'new password should not be same as old password'})
    
    user.password                     = newPassword;

    user.mustChangePassword = false;
    user.changePasswordDate = Date.now();

    const [err,result] = await tojs(user.save())

    if (err) return next({msg:'there was an error in operation'})

    res.payload = {msg:'operation successful'}

    return next();
});
router.post('/reset-password',[auth,sysAdmin],async(req,res,next)=>{
    const schema  = Joi.object({
        userID:         Joi.string().required(),
        password:       Joi.string().required()
                           .regex(new RegExp(getConfig('passwordComplexity')))
                           .messages({'string.pattern.base': 'password does not meet minimum complexity'}),
        token:          Joi.any().allow(null,'').optional(),
    })
    const {error} = schema.validate(req.body,{abortEarly:false});
    if (error) return next({status:400,msg:error.details.map(x=>x.message)});

    const {userID,password} = req.body;

    const user = await User.findOne({userID})
    if(!user) return next({status:404,msg:'user not found'});

    user.password           = password
    user.changePasswordDate = Date.now();

    const [err,result] = await tojs(user.save())

    if (err) return next({msg:'there was an error in operation'})

    res.payload = {msg:'password change successfully'}

    return next();
});
router.post('/edit-myinfo',[auth],async(req,res,next)=>{
    
    const schema  = Joi.object({
	    email:      Joi.string().optional().allow(null,''),
	    mobile:     Joi.number().optional().allow(null,''),
        tel:        Joi.number().optional().allow(null,''),
        address:    Joi.string().optional().allow(null,''),

        token:Joi.any().allow(null,'').optional(),
    })
    const {error} = schema.validate(req.body,{abortEarly:false});
    if (error) return next({status:400,msg:error.details.map(x=>x.message)});

    const {email,mobile,tel,address} = req.body

    let [err,user] = await tojs(User.findOne({userID:req.userinfo.userID}))

    if (!user) return next({msg:'user not found'})
    if (err)   return next({msg:'there is an error on fetching data from database'})
    
    user.email   = email   != undefined ? email   : user.email
    user.mobile  = mobile  != undefined ? mobile  : user.mobile
    user.tel     = tel     != undefined ? tel     : user.tel
    user.address = address != undefined ? address : user.address

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
    const {error} = schema.validate(req.body,{abortEarly:false});
    if (error) return next({status:400,msg:error.details.map(x=>x.message)});

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
    const {error} = schema.validate(req.body,{abortEarly:false});
    if (error) return next({status:400,msg:error.details.map(x=>x.message)});

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
    const {error} = schema.validate(req.body,{abortEarly:false});
    if (error) return next({status:400,msg:error.details.map(x=>x.message)});

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
