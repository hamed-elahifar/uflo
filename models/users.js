const mongoose          = require('mongoose')
const {mongoDB}         = require('../startup/mongodb')
const {sign}            = require('jsonwebtoken')
const bcrypt            = require('bcryptjs')
const {v4:uuidv4}       = require('uuid');

const userSchema = new mongoose.Schema({
    userID:{
        type:           String,
        default:        uuidv4(),
    },
    username:{
        trim:           true,
        type:           String,
        maxlength:      30,
        unique:         true,
        index:          true,
        lowercase:      true,
        required:       true,
    },
    firstname:{
        trim:           true,
        type:           String,
        maxlength:      30,
        required:       true,
    },
    lastname:{
        trim:           true,
        type:           String,
        maxlength:      30,
        required:       true,
    },
    email:{
        trim:           true,
        type:           String,
        maxlength:      255,
        lowercase:      true,
        required:       true,
        unique:         true
    },
    password:{
        type:           String,
        required:       true,
        // minlength:   3,
        // maxlength:   1024,
        select:         false
    },
    role:{
        type:           String,
        enum:           ['admin','user','professor','TA']
    },
    active:{
        type:           Boolean,
        default:        true
    },
    enabled:{
        type:           Boolean,
        default:        true
    },
    birthDate:{
        type:           String,
    },
    address:{
        type:           String,
    },
    incorrectPassCount:{
        type:           Number,
        maxlength:      1,
        default:        0,
    },
    lastLoginDate:{
        type:           Date,
    },
    changePasswordDate:{
        type:           Date,
    },
    university:         String,

},{timestamps:          true,
   // toObject:         {virtuals:true},
   toJSON:              {virtuals:true},
//    shardkey:            {partition:1}
});

userSchema.index({username:1,email:1},{unique:true,background:true});

// hash password
userSchema.pre('save',async function (next){
    if (this.isModified('password')){
        try{
            const salt    = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password,salt);

        } catch(err) {
            next(err)
        }
    }

    next();
});
// clear redis cache
userSchema.pre('save',async function (next){
    // redis.del('User_'+this.NidUser)
    // next()
});
// check for Active Date
userSchema.post('init', function(doc) {

    // const date = new Date();

    // let {startActiveDate,endActiveDate} = doc

    // startActiveDate = startActiveDate ? startActiveDate : undefined
    // endActiveDate   = endActiveDate   ? endActiveDate   : undefined

    // if (!startActiveDate)
    //     this.enabled = false

    // if (date < startActiveDate)
    //     this.enabled = false

    // if (date > endActiveDate)
    //     this.enabled = false
});

userSchema.methods.generateAuthToken = () => {
    return sign({ 
            userID:         this.userID,
            username:       this.username,
            firstname:      this.firstname,
            lastname:       this.lastname,
            role:           this.role,
        },
        // privateKey,
        getConfig('jwt.token'),
        {
            expiresIn:      '7d', // 7 Days
            // algorithm:      'RS256'
        }
    );
}

userSchema.methods.validatePassword = async (password) => {
    return await bcrypt.compare(password,this.password);
}

const   User = mongoDB.model('users',userSchema,'users');

exports.User = User;