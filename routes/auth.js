const { request } = require('express');

const router            = require('express').Router()
  ,   {User}            = require('../models/users')

  ,   bcrypt            = require('bcryptjs')
  ,   Joi               = require('@hapi/joi')

  ,  {sysAdmin}         = require('../middleware/sysRoles')
  ,   auth              = require('../middleware/auth')
  ,  {passport}         = require('../services/passport')

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


router.get ('/google',
    passport.authenticate('google',{scope:['email','profile']}
))
router.get ('/google/callback',
    passport.authenticate('google',{
        successRedirect:'/auth/google/success',
        failureRedirect:'/auth/google/failure',
        session: false
}))

router.get('/google/success',(req,res)=>{res.send('/google/success')})
router.get('/google/failure',(req,res)=>{res.send('/google/failure')})

module.exports = router;
