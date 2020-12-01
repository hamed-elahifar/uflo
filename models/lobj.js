const mongoose     = require('mongoose')
const {mongoDB}    = require('../startup/mongodb')

const lobjSchema = new mongoose.Schema({

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
    lessonID:{
        type:           String,
        required:       true,
        ref:            'lessons'
    },
    order:{
        type:           Number,
        min:            0
    },
    startDate:{
        type:           Date,
        default:        Date.now
    },

},{
    timestamps:          true,
    // toObject:         {virtuals:true},
    toJSON:              {virtuals:true},
});

lobjSchema.virtual('course',{
    ref:           'courses',
    localField:    'courseID',
    foreignField:  'courseID',
    justOne:        true,
});
lobjSchema.virtual('chapter',{
    ref:           'chapters',
    localField:    'chapterID',
    foreignField:  'chapterID',
    justOne:        true,
});
lobjSchema.virtual('lesson',{
    ref:           'lessons',
    localField:    'lessonID',
    foreignField:  'lessonID',
    justOne:        true,
});

const   Lobj = mongoDB.model('lobjs',lobjSchema,'lobjs');

exports.Lobj = Lobj;