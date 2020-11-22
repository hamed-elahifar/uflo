const mongoose     = require('mongoose')
const {mongoDB}    = require('../startup/mongodb')

const courseSchema = new mongoose.Schema({
    
    // students:
    // owners
    
    // slug
    // chapters
    // passcode

    courseID:{
        type:           String,
        default:        () => Math.random().toString(35).substr(2,6),
    },
    name:{
        type:           String,
        required:       true
    },
    description:        String,
    professorID:{
        type:           String,
        ref:            'users',
        required:       true,
    },
    startDate:          Date,
    endDate:            Date,
    syllabus:           String,

},{
    timestamps:         true,
    // toObject:           {virtuals:true},
    toJSON:             {virtuals:true},
});

courseSchema.virtual('professor',{
    ref:             'users',
    localField:      'professor',
    foreignField:    'userID',
    justOne:          true,
});

const   Course = mongoDB.model('courses',courseSchema,'courses');

exports.Course = Course;