const mongoose     = require('mongoose')
const {mongoDB}    = require('../startup/mongodb')

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
    justOne:          true,
});

const   Course = mongoDB.model('courses',courseSchema,'courses');

exports.Course = Course;