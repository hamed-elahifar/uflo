const mongoose          = require('mongoose')
const {mongoDB}         = require('../startup/mongodb')
const {sign}            = require('jsonwebtoken')
const bcrypt            = require('bcryptjs')
const {v4:uuidv4}       = require('uuid');

const userSchema = new mongoose.Schema({

    userID:{
        type:           String,
        // default:        uuidv4(),
    },
    // username:{
    //     trim:           true,
    //     type:           String,
    //     maxlength:      30,
    //     unique:         true,
    //     index:          true,
    //     lowercase:      true,
    //     required:       true,
    // },
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
        // required:       true,
        // minlength:   3,
        // maxlength:   1024,
        select:         false
    },
    role:{
        type:           String,
        enum:           ['admin','student','professor','TA']
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
    courseIDs:{
        type:           [String],
        ref:            'course'
    },
    // incorrectPassCount:{
    //     type:           Number,
    //     maxlength:      1,
    //     default:        0,
    // },
    lastLoginDate:{
        type:           Date,
    },
    // changePasswordDate:{
    //     type:           Date,
    // },
    university:         String,
    classLevel:{
        type:           String,
        enum:           ['Freshman','Sophomore','Junior','Senior']
    },
    major:              [String],
    academicPerformance:{
        CurrentAcademicPerformance:{
            type:       String,
            enum:       ['Excellent','Good','Average','Below Average']
        },
        DesiredAcademicPerformance:{
            type:       String,
            enum:       ['Excellent','Good','Average','Below Average']

        },
    },
    examTakingPerformance:{
        ExamType:{
            type:       String,
            enum:       ['Analytical','Memorization']
        },
        QuestionType:{
            type:       String,
            enum:       ['Multiple Choice','Free Response']
        },
    },
    learningHabits:{
        ProcrastinationLevel:{
            type:       String,
            enum:       ['High','Medium','Low']
        },
        LearningType:{
            type:       [String],
            enum:       ['Visual','Verbal/Auditory','Kinesthetic','Reading/Writing']
        },
    },
    theme:{
        type:           String,
        enum:           ['Dark','Light']
    }

},{
    timestamps:          true,
    // toObject:         {virtuals:true},
    toJSON:              {virtuals:true},
});

userSchema.index({userID:1,email:1},{unique:true,background:true});

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

userSchema.methods.generateAuthToken = function (ip) {
    // this should NOT be an arrow function => ()
    return sign({ 
            userID:         this.userID,
            email:          this.email,
            firstname:      this.firstname,
            lastname:       this.lastname,
            role:           this.role,
            ip:             ip,
        },
        // privateKey,
        getConfig('jwt.token'),
        {
            expiresIn:      '7d',
            // algorithm:      'RS256'
        }
    );
}

userSchema.methods.validatePassword = async (password) => {
    return await bcrypt.compare(password,this.password);
}

userSchema.virtual('courses',{
    ref:           'courses',
    localField:    'courseIDs',
    foreignField:  'courseID',
    justOne:       false,
});

const   User = mongoDB.model('users',userSchema,'users');

exports.User = User;