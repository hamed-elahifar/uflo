const mongoose     = require('mongoose')
const {mongoDB}    = require('../startup/mongodb')

const lessonSchema = new mongoose.Schema({
    title:{
        type:           String,
        required:       true
    },
    courseID:{
        type:           String,
        required:       true,
        ref:            'courses'
    },
    chapter:            String,
    lesson:{
        type:           Number,
    },
    frame:[{
        number:         Number,
        content:        String,
    }],
    version:{
        type:         String,
        enum:         ['A','B','C','D'],
        required:     false
    }
},{timestamps:          true,
        // toObject:         {virtuals:true},
        toJSON:              {virtuals:true},
});

courseSchema.virtual('course',{
    ref:             'courses',
    localField:      'courseID',
    foreignField:    'courseID',
    justOne:          true,
});

const   Lesson = mongoDB.model('lessons',lessonSchema,'lessons');

exports.Lesson = Lesson;