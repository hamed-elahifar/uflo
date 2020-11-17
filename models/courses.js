const mongoose     = require('mongoose')
const {mongoDB}    = require('../startup/mongodb')

const courseSchema = new mongoose.Schema({
    courseID:{
        type:           String,
        default:        () => {Math.random().toString(35).substr(2,3)},
    },
    title:{
        type:           String,
        required:       true
    },
    univsersity:{
        type:           String,
        required:       true
    },
    professor:{
        type:           String,
        ref:            'users',
        required:       true,
    },
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