const mongoose     = require('mongoose')
const {mongoDB}    = require('../startup/mongodb')

const lessonSchema = new mongoose.Schema({
    
    title:{
        type:           String,
        required:       true
    },
    desc:               String,
    courseID:{
        type:           String,
        required:       true,
        ref:            'courses'
    },
    chapterID:{
        type:           String,
        required:       true,
        ref:            'chapters'
    },
    order:{
        type:           Number,
        min:            0
    },
    startDate:          Date,

},{
    timestamps:          true,
    // toObject:         {virtuals:true},
    toJSON:              {virtuals:true},
});

lessonSchema.virtual('course',{
    ref:             'courses',
    localField:      'courseID',
    foreignField:    'courseID',
    justOne:          true,
});
lessonSchema.virtual('chapter',{
    ref:             'chapters',
    localField:      'chapterID',
    foreignField:    'chapterID',
    justOne:          true,
});

const   Lesson = mongoDB.model('lessons',lessonSchema,'lessons');

exports.Lesson = Lesson;