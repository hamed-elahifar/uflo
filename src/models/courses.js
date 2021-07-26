const mongoose      = require('mongoose')
const {mongoDB}     = require('../startup/mongodb');

const {Chapter}     = require('./chapter');
const {Lesson}      = require('./lessons')
const {Lobj}        = require('./lobj')
const {Frame}       = require('./frames')

const courseSchema = new mongoose.Schema({
    
    title:{
        type:           String,
        required:       true
    },
    desc:               String,
    courseID:{
        type:           String,
        default:        () => Math.random().toString(35).substr(2,6),
        unique:         true,
    },
    passcode:{
        type:           String,
        default:        () => Math.random().toString(35).substr(2,6),
        select:         false,
    },
    professorID:{
        type:           [String],
        ref:            'users',
        required:       true,
    },
    TAIDs:{
        type:           [String],
        ref:            'users',
    },
    startDate:{
        type:           Date,
        default:        Date.now
    },
    endDate:            Date,
    syllabus:           String,

},{
    timestamps:         true,
    // toObject:           {virtuals:true},
    toJSON:             {virtuals:true},
});

courseSchema.virtual('professor',{
    ref:             'users',
    localField:      'professorID',
    foreignField:    'userID',
});
courseSchema.virtual('TA',{
    ref:             'users',
    localField:      'TAIDs',
    foreignField:    'userID',
});

courseSchema.pre('findOneAndDelete', function(next) {
    Chapter.deleteMany(this._conditions)
        .then (() => {})
        .catch(errorLog)

    Lesson.deleteMany(this._conditions)
        .then (() => {})
        .catch(errorLog)

    Lobj.deleteMany(this._conditions)
        .then (() => {})
        .catch(errorLog)
        
    Frame.deleteMany(this._conditions)
        .then (() => {})
        .catch(errorLog)

    next();
});

const   Course = mongoDB.model('courses',courseSchema,'courses');

exports.Course = Course;