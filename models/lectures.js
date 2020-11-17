const mongoose      = require('mongoose')
const {mongoDB}     = require('../startup/mongodb')

const lectureSchema = new mongoose.Schema({
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
    students:[{
        userID:{
            type:       String,
            ref:        'users'
        },
        grade:          String,
    }],
    meetings:[{
        name:           String,
        owner:          String,
        time:           Date,
        address:        String,
    }]
},{
    timestamps:         true,
    // toObject:           {virtuals:true},
    toJSON:             {virtuals:true},
});

courseSchema.virtual('course',{
    ref:             'courses',
    localField:      'courseID',
    foreignField:    'courseID',
    justOne:          true,
});

const   Lecture = mongoDB.model('lectures',lectureSchema,'lectures');

exports.Lecture = Lecture;